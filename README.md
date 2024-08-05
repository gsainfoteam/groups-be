# Groups

## Purpose

GIST에 동아리와 같은 그룹을 만들고, 인원을 관리하는 시스템을 만들기 위한 API이다.  
기본적으로 모든 인원이 IDP를 사용한다는 전제로 개발되었다. 따라서 사람의 식별은 IDP의 access token으로 진행한다.  
Groups는 사용자가 속한 그룹을 더 효과적으로 관리하기 위해서 별도의 access token을 만들어서 관리한다.

## DataBase Structure

ERD: <https://dbdocs.io/INFOTEAM%20GIST/groups>

## Activated Urls

staging_url: <https://api.stg.groups.gistory.me>
staging_swagger_url: <https://api.stg.groups.gistory.me/api>
