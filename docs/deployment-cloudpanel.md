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

## Checklist antes do rerun

Antes de rerodar a pipeline, estes itens precisam estar verdadeiros no servidor:

1. O usuário `lucksystems-app-financeflow` aceita SSH com a chave usada no GitHub Actions.
2. O diretório `/home/lucksystems-app-financeflow/releases` existe e pertence ao usuário do site.
3. O caminho `/home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br` já foi convertido de diretório real do CloudPanel para symlink de release.
4. O checklist de validacao mobile em `docs/manual-mobile-validation-checklist.md` foi executado e aprovado para iOS/Android (retrato/paisagem).

Teste rápido de SSH a partir da sua máquina:

```powershell
ssh -i "$env:USERPROFILE\.ssh\financeflow_actions" -o BatchMode=yes lucksystems-app-financeflow@168.231.97.217 "echo APP_SSH_OK"
```

Hoje esse acesso ainda precisa ser corrigido no VPS, porque o usuário do site não está aceitando a chave.

## Converter o docroot do CloudPanel em symlink

Se o CloudPanel criou `htdocs/app.financeflow.lucksystems.com.br` como diretório normal, converta uma vez antes do primeiro deploy:

```bash
mkdir -p /home/lucksystems-app-financeflow/releases/bootstrap/app
rsync -a /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br/ /home/lucksystems-app-financeflow/releases/bootstrap/app/
mv /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br.bak
ln -s /home/lucksystems-app-financeflow/releases/bootstrap/app /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br
chown -h lucksystems-app-financeflow:lucksystems-app-financeflow /home/lucksystems-app-financeflow/htdocs/app.financeflow.lucksystems.com.br
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
