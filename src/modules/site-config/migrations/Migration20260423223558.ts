import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260423223558 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_config" drop constraint if exists "site_config_key_unique";`);
    this.addSql(`create table if not exists "site_config" ("id" text not null, "key" text not null, "value" text null, "label" text null, "description" text null, "group" text null, "is_public" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_site_config_key_unique" ON "site_config" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_config_deleted_at" ON "site_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_config" cascade;`);
  }

}
