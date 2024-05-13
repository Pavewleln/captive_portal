# Captive Portal

## Обзор
Проект Captive Portal был успешно протестирован на роутере с OpenWRT версии 23.05 и CoovaChilli, а также на операционной системе Debian 12.

## Используемые технологии
- FreeRADIUS версии 3.0
- PostgreSQL версии 15
- Nginx
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js с фреймворком Express


## Сборка deb пакета
```bash
cd captive_portal-1.0
sudo debuild -us -uc -b
```

## Установка deb пакета
```bash
dpkg -i captive-portal_1.0_amd64.deb
```

Все необходимые зависимости устонавливаются в ручную