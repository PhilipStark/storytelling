"""initial migration

Revision ID: 1a2b3c4d5e6f
Revises: 
Create Date: 2024-03-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from app.models import BookStatus

revision = '1a2b3c4d5e6f'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table('books',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('genre', sa.String(), nullable=False),
        sa.Column('target_audience', sa.String(), nullable=False),
        sa.Column('style', sa.String(), nullable=False),
        sa.Column('tone', sa.String(), nullable=False),
        sa.Column('length', sa.String(), nullable=False),
        sa.Column('content', sa.JSON(), nullable=True),
        sa.Column('status', sa.Enum(BookStatus), nullable=False, default=BookStatus.DRAFT),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_books_id'), 'books', ['id'], unique=False)
    op.create_index(op.f('ix_books_title'), 'books', ['title'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_books_title'), table_name='books')
    op.drop_index(op.f('ix_books_id'), table_name='books')
    op.drop_table('books')