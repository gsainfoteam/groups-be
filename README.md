# Groups

## Purpose

GIST에 동아리와 같은 그룹을 만들고, 인원을 관리하는 시스템을 만들기 위한 API이다.  
기본적으로 모든 인원이 IDP를 사용한다는 전제로 개발되었다. 따라서 사람의 식별은 IDP의 access token으로 진행한다.

## Clarify

### 각 주체들의 명칭 정리

본 문서에서 다루는 주체는 하나가 아닌 여러 개가 존재한다.  
따라서 이들을 정리할 필요가 있다.  
먼저, 본 프로젝트는 groups라고 명명한다. 또한 [Infoteam-IdP](https://github.com/gsainfoteam/idp-be)는 IdP라고 명명한다. 마지막으로, 이 프로젝트를 이용하여 다른 기능을 제공하는 주체를 서비스라고 명명한다.

### 프로젝트에서 사용되는 Token에 관한 정리

본 프로젝트에서는 IdP에서 발급하는 access token를 IdP token, groups에서 사용자가 포함되어 있는 그룹을 인증하기 위한 token을 group certificate token (줄여서 group cert token) 이라고 명명한다.  
또한, IdP를 발급하는 주체에 따라서 groups에서 발급한 token을 groups IdP token, 서비스에서 발급한 token을 service IdP token이라고 한다.

따라서 본 프로젝트에서는 groups IdP token, service IdP token, group cert token, 총 3개의 토큰이 다루어진다.

## API DOCS

API docs는 swagger로 구현이 되었으며, 각 문서는 아래의 페이지에서 확인할 수 있다.

prod: <https://api.groups.gistory.me/api>  
stg: <https://api.stg.groups.gistory.me/api>

## DataBase Structure

ERD: <https://dbdocs.io/INFOTEAM%20GIST/groups>
