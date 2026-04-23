import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260423193701 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blog_post" drop constraint if exists "blog_post_slug_unique";`);
    this.addSql(`create table if not exists "blog_post" ("id" text not null, "slug" text not null, "title" text not null, "excerpt" text null, "content" text null, "thumbnail" text null, "author_name" text null, "tags" text[] null, "is_published" boolean not null default false, "published_at" timestamptz null, "views" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_post_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blog_post_slug_unique" ON "blog_post" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_post_deleted_at" ON "blog_post" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog_post" cascade;`);
  }

}
