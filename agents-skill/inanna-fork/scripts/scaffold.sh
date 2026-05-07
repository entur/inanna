#!/usr/bin/env bash
# scaffold.sh — clone Inanna from a pinned branch into a clean target and re-init git.
#
# Usage: scaffold.sh <target> <project-name>
#
#   target       Path where the new fork should live; must NOT exist
#   project-name kebab-case npm package name for the new project
#
# The source URL and branch are pinned (see consts below) so every fork
# starts from the same known revision regardless of what 'main' currently is.

set -euo pipefail

# ── pinned upstream ────────────────────────────────────────────────────────
readonly INANNA_URL="https://github.com/entur/inanna.git"
readonly INANNA_BRANCH="fix/issue5-docs"
# ───────────────────────────────────────────────────────────────────────────

dst="${1:?usage: $0 <target> <project-name>}"
name="${2:?usage: $0 <target> <project-name>}"

[[ -e "$dst" ]] && { echo "target $dst already exists; aborting" >&2; exit 1; }
command -v git >/dev/null || { echo "git is required" >&2; exit 1; }

# Shallow clone of the pinned branch only, then drop the upstream history.
git clone --depth 1 --branch "$INANNA_BRANCH" --single-branch "$INANNA_URL" "$dst"
rm -rf "$dst/.git" "$dst/node_modules" "$dst/dist" "$dst/build" "$dst/.vite"

cd "$dst"

# Update package.json `name` field only (preserve ordering and formatting).
node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('package.json','utf8'));
  p.name = '$name';
  fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
"

# Replace the first H1 in README.md with the new project name (best-effort).
if [[ -f README.md ]]; then
  awk -v name="$name" '
    BEGIN { replaced = 0 }
    /^# / && !replaced { print "# " name; replaced = 1; next }
    { print }
  ' README.md > README.md.new && mv README.md.new README.md
fi

# Fresh git history.
git init -q -b main
git add -A
git -c commit.gpgsign=false commit -qm "chore: scaffold $name from inanna@$INANNA_BRANCH"

cat <<EOF
Scaffolded '$name' at $dst
  source: $INANNA_URL
  branch: $INANNA_BRANCH (pinned)

Next steps:
  cd $dst
  npm install
  npm run dev   # confirm it boots before continuing

Then return to the inanna-fork skill for Phase 2 (open-questions interview).
EOF
