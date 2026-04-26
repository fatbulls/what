import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260426165015 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "faq_item" ("id" text not null, "slot" text not null default 'main', "position" integer not null default 0, "question" text not null, "answer" text not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "faq_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_faq_item_deleted_at" ON "faq_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "faq_item" cascade;`);
  }

}
