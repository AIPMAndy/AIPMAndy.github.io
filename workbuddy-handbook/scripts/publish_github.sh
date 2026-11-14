#!/usr/bin/env bash
# Publish a newly-created local WorkBuddy Handbook to a PUBLIC GitHub repository.
# Requires GitHub CLI and authenticated account. Does not force push or overwrite a remote.
set -euo pipefail
cd "$(dirname "$0")/.."
OWNER="${GITHUB_OWNER:-AIPMAndy}"
NAME="${GITHUB_REPO:-workbuddy-handbook}"
FULL="$OWNER/$NAME"
if ! command -v git >/dev/null 2>&1 || ! command -v gh >/dev/null 2>&1; then
  echo '需要 git 与 GitHub CLI (gh)：https://cli.github.com/'; exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo '请先运行 gh auth login 登录授权账号'; exit 1
fi
LOGIN="$(gh api user --jq '.login')"
if [[ "$LOGIN" != "$OWNER" ]]; then
  echo "当前登录 $LOGIN，但目标为 $OWNER。请检查 GITHUB_OWNER 或登录账号。"; exit 1
fi
if gh repo view "$FULL" >/dev/null 2>&1; then
  echo "仓库 $FULL 已存在。为避免误覆盖或冲突，请自行检查远端后再执行 git push。"
  echo "地址：https://github.com/$FULL"; exit 2
fi
if [[ -e .git ]]; then
  echo '当前目录已经是 Git 仓库。请先核对分支和远端，避免误覆盖。'; exit 2
fi
printf '即将新建公开仓库 https://github.com/%s，并上传本目录文件。\n' "$FULL"
read -r -p '确认公开发布且不含隐私数据？键入 publish 继续: ' CONFIRM
[[ "$CONFIRM" == 'publish' ]] || { echo '已取消'; exit 1; }
git init -b main
git add .
git commit -m 'docs: publish independent WorkBuddy Chinese field guide v1.0'
gh repo create "$FULL" --public --source=. --remote=origin --push
printf '\n代码已推送。请进入 https://github.com/%s/settings/pages 启用 Deploy from a branch / main /docs。\n' "$FULL"
