# Object Module

AWS의 S3를 더 쉽게 조작하기 위해서 사용되는 module입니다.

## Environment

사용되는 package들은 다음과 같습니다.

- @nestjs/common
- @nestjs/config
- @aws-sdk/client-s3

이용하기 위해서 필요한 설정 변수는 다음과 같습니다. 

``` env
    AWS_S3_REGION=yourbucketregion
    AWS_S3_BUCKET=yourbucket
    AWS_ACCESS_KEY_ID=xxxxxxxxxx
    AWS_SECRET_ACCESS_KEY=xxxxxxx
```

## Function

기능은 다음과 같습니다.

- AWS S3에 object를 업로드합니다.
- AWS S3에 object를 삭제합니다.
