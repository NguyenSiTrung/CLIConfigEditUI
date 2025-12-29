#!/bin/bash
# Run this AFTER making the repository public
# Usage: ./.github/scripts/setup-branch-protection.sh

set -e

REPO="NguyenSiTrung/CLIConfigEditUI"

echo "Setting up branch protection for $REPO..."

# Enable branch protection with admin bypass
gh api repos/$REPO/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  --input - << 'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

echo "✅ Branch protection enabled!"
echo "   - PRs require 1 approval"
echo "   - Stale reviews are dismissed"
echo "   - Admins can bypass (enforce_admins: false)"
echo "   - Force pushes disabled"

# Enable secret scanning
echo "Enabling secret scanning..."
gh api repos/$REPO -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -f security_and_analysis='{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}'

echo "✅ Secret scanning and push protection enabled!"
