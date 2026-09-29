# Shared reverse-proxy settings for every microfrontend upstream.
# Included from mfe.conf — kept in one place so all four apps are treated alike.

proxy_http_version 1.1;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host  $host;

# WebSockets for Next dev/HMR and any future streaming responses.
proxy_set_header Upgrade    $http_upgrade;
proxy_set_header Connection $connection_upgrade;

# Each application declares its own basePath, so paths are passed through
# untouched and proxy_redirect never has to rewrite a Location header.
proxy_redirect off;
proxy_buffering  on;
proxy_connect_timeout 5s;
proxy_send_timeout    60s;
proxy_read_timeout    60s;

# BFF route handlers may take a moment while a domain service responds.
client_max_body_size 2m;
