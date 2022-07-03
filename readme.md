# Service optimization images from WEB format, from clear node.js and sharp.js

## Dev:
- `npm i`
- `npm run cmd/main.js`
#

## Prod:
- `docker-compose up --build -d`
#

## Intruction:
- global url path - `/image/v2`
- /optimize
<pre>
	localhost:5002/image/v2/optimize
		?h={{height not required with width set}}
		&w={{width not required with height set}}
		&f={{image fit type: contain,cover}}
		&src={{image url, only net access}}
		&t={{return image type accessed: jpeg (default), png, webp, avif}}
</pre>
- /metrics - `return metrics from prometheus`
#

## NGINX config:
<pre>
proxy_cache_path  /var/cache/nginx/cache levels=1:2 keys_zone=STATIC:50m max_size=3g inactive=30000m;

location /image/v2/optimize/ {

    # Информационноый заголовок для определения статуса кеша
    add_header X-Cache-Status $upstream_cache_status;

    # Кешируем на клиенте на 3 года, согласно рекомендаций Google Lighthouse
    expires 3y;

    # Настраиваем кеш на сервере на 1 сутки
    proxy_cache STATIC;
    proxy_cache_valid      200  1d;
    proxy_cache_use_stale  error timeout invalid_header updating http_500 http_502 http_503 http_504;

    # Если кеш протух, клиенту вернется старый, а сервер пойдет за новым. Клиент не будет ждать
    proxy_cache_background_update on;

    # Посылать только один запрос на микросервис оптимизации, остальные будут ждать в очереди
    proxy_cache_lock on;

    # Указываем адрес микросервиса оптимизации
    proxy_pass http://localhost:5002/;
}</pre>
#

## Benchmark:
Task - resize image, and convert to format.
Image default size - `3.1Mb`, type - `jpg`.
Image default height - `977px`, width - `1648px`.
Image optimize height - `200px`, width - `300px`.

| Type   |      Time (ms)      |  Size (Kb) |
|--------|:-------------------:|-----------:|
|png     |        644          | 148.48|
|jpeg     |        639          | 18.37|
|webp     |        647          | 22.83|
|avif     |        775          | 24.22|
