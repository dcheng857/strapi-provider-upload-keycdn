# strapi-provider-upload-keycdn

KeyCDN provider for Strapi v4 file upload.

## Installation

```bash
# using yarn
yarn add strapi-provider-upload-keycdn

# using npm
npm install strapi-provider-upload-keycdn
```

## Provider Configuration

1. Create or update config in `./config/plugins.js` with content

```
module.exports = ({ env }) => ({
    // ...
    upload: {
        config: {
            provider: "strapi-provider-upload-keycdn",
            providerOptions: {
                host: env("KEYCDN_HOST"),
                port: env("KEYCDN_PORT"),
                user: env("KEYCDN_USER"),
                password: env("FKEYCDN_PASSWORD"),
                reconnectTimeout: env("KEYCDN_RECONNECT_TIMEOUT"),
                uploadPath: env("KEYCDN_UPLOAD_PATH"),
                baseUrl: env("KEYCDN_BASEURL"),
                jpgQuality: env("KEYCDN_JPG_QUALITY"),
                pngQuality: env("KEYCDN_PNG_QUALITY"),
            },
        },
    },
});
```

| Property         | Required | Type             | Description                                                                                                                                                                       |
| ---------------- | -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| host             | true     | string           | Host of the KeyCDN FTP                                                                                                                                                            |
| port             | true     | string           | Port of the KeyCDN FTP                                                                                                                                                            |
| user             | true     | string           | Username of the KeyCDN ftp user FTP                                                                                                                                               |
| password         | true     | string           | Password of the KeyCDN ftp user                                                                                                                                                   |
| reconnectTimeout | false    | number           | Timeout of the reconnect of KeyCDN if exceed 3 connects, default is 2000 (2 seconds)                                                                                              |
| uploadPath       | false    | string           | The path of the upload on KeyCDN ftp server                                                                                                                                       |
| baseUrl          | true     | string           | CDN base url                                                                                                                                                                      |
| jpgQuality       | false    | number           | Compression quality, in range 0 (worst) to 100 (perfect).                                                                                                                         |
| pngQuality       | false    | [number, number] | Instructs pngquant to use the least amount of colors required to meet or exceed the max quality. If conversion results in quality below the min quality the image won't be saved. |

Min and max are numbers in range 0 (worst) to 1 (perfect), similar to JPEG. |

2. Add config in the `.env`.

```bash
KEYCDN_HOST=
KEYCDN_PORT=
KEYCDN_USER=
FKEYCDN_PASSWORD=
KEYCDN_RECONNECT_TIMEOUT=
KEYCDN_UPLOAD_PATH=
KEYCDN_BASEURL=
KEYCDN_JPG_QUALITY=
KEYCDN_PNG_QUALITY=
```

## Resources

- [MIT License](LICENSE.md)

## Links

- [Strapi website](https://strapi.io/)
- [Strapi documentation](https://docs.strapi.io)
- [Strapi community on Discord](https://discord.strapi.io)
- [Strapi news on Twitter](https://twitter.com/strapijs)
