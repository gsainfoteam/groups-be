# Vapor Auth

## Purpose

GIST에 동아리와 같은 그룹을 만들고, 인원을 관리하는 시스템을 만들기 위한 API이다.  
기본적으로 모든 인원이 IDP를 사용한다는 전제로 개발되었다. 따라서 사람의 식별은 IDP의 access token으로 진행한다.
그룹의 정보를 얻는 API는 모두에게 열려 있으므로, IDP의 토큰이 필요하지 않으나, 나머지 그룹의 인원, 각 인원의 역할과 같은 그룹 내에서만 전달이 되어야 하는 정보나, 그룹을 만드는 API는 IDP의 access token이 필수적이다.

## DataBase Structure

ERD: https://dbdocs.io/siwonpada/vapor_auth_be

## Activated Urls.

staging_url: https://api.stg.auth.vapor.gistory.me  
staging_swagger_url: https://api.stg.auth.vapor.gistory.me/api

## Todos

Group CRUD
Confirm Group -> when the create the group
User Role in the Group
Group name Unique
check if the user in the group

## Endpoints

GET /group - don't need access token  
GET /group/:groupname  
POST /group  
PATCH /group  
DELETE /group  
GET /group/:groupname/member  
POST /group/:groupname/member  
DELETE /group/:groupname/member/:uuid  
GET /group/:groupname/member/:uuid/role  
POST /group/:groupname/member/:uuid/role/:id  
GET /group/:groupname/role  
POST /group/:groupname/role  
UPDATE /group/:groupname/role  
DELETE /group/:groupname/role
