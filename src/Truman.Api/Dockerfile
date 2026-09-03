FROM node:26-alpine AS web-build
WORKDIR /src/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
# The Sentry Vite plugin uploads source maps during the build, so it needs a token here.
# Mounted as a BuildKit secret rather than passed as a build arg: build args are recorded
# in the image history. Fork PRs get no secrets, so the mount may be absent — the plugin
# warns and skips the upload in that case, and the build still succeeds.
RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token 2>/dev/null); \
    export SENTRY_AUTH_TOKEN; \
    npm run build

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
# Supplied by CI, which has the git history that MinVer needs and this build does not.
# Left empty for local builds, where MinVer falls back to its own default.
ARG VERSION=
WORKDIR /src
COPY ["Truman.Api/Truman.Api.csproj", "Truman.Api/"]
COPY ["Truman.Data/Truman.Data.csproj", "Truman.Data/"]
COPY Directory.Packages.props ./
COPY Directory.Build.props ./
RUN dotnet restore "Truman.Api/Truman.Api.csproj"
COPY . .
RUN dotnet publish "Truman.Api/Truman.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 5001
COPY --from=build /app/publish .
COPY --from=web-build /src/web/build /app/web/build
ENTRYPOINT ["dotnet", "Truman.Api.dll"]
