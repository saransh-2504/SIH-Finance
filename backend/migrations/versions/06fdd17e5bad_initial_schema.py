"""initial_schema

Revision ID: 06fdd17e5bad
Revises:
Create Date: 2026-09-03

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "06fdd17e5bad"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("preferred_language", sa.String(5), nullable=False, server_default="en"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # assessments
    op.create_table(
        "assessments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("village", sa.String(255), nullable=False),
        sa.Column("block", sa.String(255), nullable=True),
        sa.Column("district", sa.String(255), nullable=True),
        sa.Column("state", sa.String(255), nullable=True),
        sa.Column("pin_code", sa.String(10), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("business_name", sa.String(255), nullable=False),
        sa.Column("business_category", sa.String(100), nullable=False),
        sa.Column("goals", sa.Text(), nullable=True),
        sa.Column("available_capital", sa.Float(), nullable=False),
        sa.Column("project_cost", sa.Float(), nullable=False),
        sa.Column("loan_amount", sa.Float(), nullable=False),
        sa.Column("feasibility_score", sa.Integer(), nullable=True),
        sa.Column("confidence", sa.String(20), nullable=True),
        sa.Column("market_data", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("finance_data", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("analysis_data", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_assessments_user_id", "assessments", ["user_id"])

    # conversations
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("assessment_id", sa.String(36), sa.ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("messages", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"])


def downgrade() -> None:
    op.drop_table("conversations")
    op.drop_table("assessments")
    op.drop_table("users")
