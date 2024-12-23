# Infoteam idp Module

인포팀의 idp를 더 쉽게 사용하기 위한 module입니다.

## Environment

사용되는 package들은 다음과 같습니다.

- @nestjs/common
- @nestjs/config
- @nestjs/axios
- rxjs
- axios

이용하기 위해서 필요한 설정 변수는 다음과 같습니다.  

``` env
    IDP_URL=https://api.idp.gistory.me
    IDP_CLIENT_ID=yourclientid
    IDP_CLIENT_SECRET=yourclientsecret
```

위의 설정변수를 보면 알 수 있겠지만, 해당 모듈을 사용하기 위해서는 먼저 infoteam idp에서 client등록을 해야지 사용할 수 있습니다.

## Function

기능은 다음과 같습니다.  

- authorization_code를 이용해서 AccessToken으로 돌려받음.
- AccessToken을 이용해서, 해당 유저의 정보들을 돌려받음.
