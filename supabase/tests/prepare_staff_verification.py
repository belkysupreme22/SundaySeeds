"""Assemble the unapplied staff migration and rollback-only pgTAP suite.

Run from the repository root. Writes SQL to /tmp; never connects to a database.
The prerequisites must already exist, and the staff schema must be absent.
This splitter supports this suite's quoted bodies and line comments only.
"""
from pathlib import Path
import re


def split_sql(source):
    statements = []
    start = index = 0
    quote = None
    comment = False
    while index < len(source):
        if comment:
            if source[index] == "\n":
                comment = False
            index += 1
            continue
        if quote:
            if source.startswith(quote, index):
                if quote in ["'", '"'] and source.startswith(quote * 2, index):
                    index += 2
                    continue
                index += len(quote)
                quote = None
                continue
            index += 1
            continue
        if source.startswith("--", index):
            comment = True
            index += 2
            continue
        if source[index] in ["'", '"']:
            quote = source[index]
            index += 1
            continue
        if source[index] == "$":
            match = re.match(r"\$[A-Za-z_0-9]*\$", source[index:])
            if match:
                quote = match.group()
                index += len(quote)
                continue
        if source[index] == ";":
            statements.append(source[start:index])
            start = index + 1
        index += 1
    if quote:
        raise ValueError("Unclosed SQL quote")
    if source[start:].strip():
        raise ValueError("Expected a final semicolon")
    return statements


def main():
    migration = Path("supabase/migrations/20261024084826_staff_course_drafts.sql").read_text()
    suite = Path("supabase/tests/staff_course_drafts.test.sql").read_text()
    output = [
        "begin;",
        "set local lock_timeout = '5s';",
        "set local statement_timeout = '60s';",
        "do $$ begin if to_regnamespace('staff_authoring_private') is not null "
        "or to_regprocedure('public.save_my_course_draft(uuid,bigint,uuid,jsonb)') is not null "
        "then raise exception 'Staff foundation already exists; refusing unapplied-schema suite'; "
        "end if; end $$;",
        migration,
    ]
    for statement in split_sql(suite):
        cleaned = re.sub(r"--[^\n]*", "", statement).strip()
        if not cleaned or cleaned.lower() in ["begin", "rollback"]:
            continue
        if cleaned.lower() == "select * from finish(true)":
            continue
        output.append(statement + ";")
    output += [
        "reset role;",
        # Hosted pgTAP finish(boolean) was inspected before use: true raises on
        # failed assertions, and no tests also raises. MATERIALIZED forces it.
        "with summary as materialized (select * from finish(true)) "
        "select _get('curr_test') - num_failed() as passed, num_failed() as failed, "
        "(select array_agg(finish) from summary) as tap_plan;",
        "rollback;",
    ]
    Path("/tmp/sundayseeds-verify-staff.sql").write_text("\n".join(output))
    print("Staff verification assembled: /tmp/sundayseeds-verify-staff.sql")


if __name__ == "__main__":
    main()
