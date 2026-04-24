import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260424174303 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "menu_item" ("id" text not null, "menu_key" text not null, "parent_id" text null, "label" text not null, "href" text null, "position" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "menu_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_menu_item_deleted_at" ON "menu_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "menu_item" cascade;`);
  }

}
