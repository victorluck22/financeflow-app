# Deploy do Frontend no CloudPanel

Este repositório contém apenas os artefatos de deploy do frontend React/Vite. O pipeline, os scripts e o guia abaixo assumem que o app roda em `app.financeflow.lucksystems.com.br` e que o repositório enviado ao GitHub é somente o conteúdo de `finances-app`.

## Secrets necessários no repositório do APP

- `PROD_SSH_HOST`
- `PROD_SSH_PORT`
- `PROD_SSH_USER`
- `PROD_SSH_PRIVATE_KEY`
- `PROD_SSH_KNOWN_HOSTS`
- `PROD_APP_DEPLOY_PATH`
- `PROD_APP_DOCROOT`
- `PROD_APP_URL`
- `PROD_API_URL`

Valores esperados em produção:

- `PROD_SSH_USER=lucksystems-app-financeflow`
- `PROD_APP_DEPLOY_PATH=/home/lucksystems-app-financeflow`
- `PROD_APP_DOCROOT=/home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br`
- `PROD_APP_URL=https://app.financeflow.lucksystems.com.br`
- `PROD_API_URL=https://api.financeflow.lucksystems.com.br`

## Estrutura remota esperada

```bash
/home/lucksystems-app-financeflow/
  releases/
  htdocs/
    app.financeflow.lucksystems.com.br -> symlink para releases/<release_id>/app
```

## Inicialização do diretório remoto

Execute uma vez no servidor, como usuário do site ou como root:

```bash
bash scripts/deploy/init-paths.sh /home/lucksystems-app-financeflow
```

## Workflow incluído

- `.github/workflows/deploy-frontend.yml`

Fluxo:

1. roda `npm ci`
2. roda `npm run test:component`
3. roda `npm run build`
4. envia o código por SSH para `releases/<release_id>/source`
5. executa `scripts/deploy/frontend.sh`
6. valida `GET /`

## Build de produção

O job de deploy recompila o frontend com `VITE_API_URL` vindo de secret. Isso garante que o bundle publicado aponte para a API correta em produção.

## Rollback

```bash
bash scripts/deploy/rollback-frontend.sh \
  /home/lucksystems-app-financeflow \
  /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br \
  <release_id>
```

## Nginx/CloudPanel

Use `scripts/deploy/nginx/frontend.cloudpanel.conf` como base do custom vhost no CloudPanel.

## Verificações após deploy

- `curl -I https://app.financeflow.lucksystems.com.br`
- carregamento da home
- acesso direto a rotas SPA, como `/dashboard`
- chamadas de rede apontando para `https://api.financeflow.lucksystems.com.br`
- assets com `Cache-Control` longo e `index.html` sem cache
