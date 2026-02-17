#!/bin/bash
echo "==============================="
echo " SUPABASE DATA PLANE GREP GATE"
echo "==============================="
echo ""

FAIL=0

for pattern in "supabase\.from(" "supabase\.rpc("; do
  echo "--- Searching for: ${pattern} ---"
  RESULTS=$(grep -rn "${pattern}" client/src/ server/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v sampleDataLoader | grep -v "\.d\.ts")
  if [ -z "$RESULTS" ]; then
    echo "  ZERO matches (PASS)"
  else
    echo "$RESULTS"
    echo "  ^^^ NON-DEV USAGE FOUND (FAIL)"
    FAIL=1
  fi
  echo ""
done

echo "--- Multi-line supabase data calls ---"
MULTILINE=$(grep -rPzo "supabase\s*\n\s*\.from\(|supabase\s*\n\s*\.rpc\(" client/src/ server/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | tr '\0' '\n')
if [ -z "$MULTILINE" ]; then
  echo "  ZERO matches (PASS)"
else
  echo "$MULTILINE"
  echo "  ^^^ MULTI-LINE SUPABASE DATA CALLS FOUND (FAIL)"
  FAIL=1
fi
echo ""

echo "--- Supabase Edge Functions (compute plane, separate migration) ---"
EDGE_COUNT=$(grep -rn 'supabase\.functions\.invoke(' client/src/ server/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v node_modules | wc -l)
echo "  Count: $EDGE_COUNT (INFO - not a data plane violation)"
echo ""

echo "--- Supabase Auth refs (allowed) ---"
echo "  Count: $(grep -rn 'supabase\.auth\.' client/src/ server/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v node_modules | wc -l)"
echo ""
echo "--- Supabase Storage refs (allowed) ---"
echo "  Count: $(grep -rn 'supabase\.storage\.' client/src/ server/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v node_modules | wc -l)"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "RESULT: ALL CLEAR - No supabase data plane calls found"
  exit 0
else
  echo "RESULT: FAIL - Active supabase.from() or supabase.rpc() calls found"
  exit 1
fi
