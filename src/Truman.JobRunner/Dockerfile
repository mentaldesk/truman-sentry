FROM mcr.microsoft.com/dotnet/runtime:9.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
# Both supplied by CI, which has the git history this build does not. MinVer needs the
# version; SourceRevisionId is what puts the commit into InformationalVersion, and hence
# into the Sentry release name — normally SourceLink's job, but it needs git too.
ARG VERSION=
ARG COMMIT_SHA=
WORKDIR /src
COPY ["Truman.JobRunner/Truman.JobRunner.csproj", "Truman.JobRunner/"]
COPY ["Truman.Data/Truman.Data.csproj", "Truman.Data/"]
COPY Directory.Packages.props ./
COPY Directory.Build.props ./
RUN dotnet restore "Truman.JobRunner/Truman.JobRunner.csproj"
COPY . .
# Same BuildKit secret as the web stage: sentry-cli uploads symbols and sources during
# publish. An absent secret leaves SENTRY_AUTH_TOKEN empty, which Directory.Build.props
# turns into UseSentryCLI=false — sentry-cli errors out on a missing token rather than
# warning, so it must not be invoked at all. Fork PRs take that path.
RUN --mount=type=secret,id=sentry_auth_token \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token 2>/dev/null); \
    if [ -n "$VERSION" ]; then \
      export MinVerVersionOverride="$VERSION"; \
    fi; \
    dotnet publish "Truman.JobRunner/Truman.JobRunner.csproj" \
      -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false \
      ${COMMIT_SHA:+/p:SourceRevisionId=$COMMIT_SHA}

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Truman.JobRunner.dll"]
