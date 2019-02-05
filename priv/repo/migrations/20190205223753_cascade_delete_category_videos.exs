defmodule Rumbl.Repo.Migrations.CascadeDeleteCategoryVideos do
  use Ecto.Migration

  def up do
    drop(constraint(:videos, "videos_category_id_fkey"))

    alter table(:videos) do
      modify(:category_id, references(:categories, on_delete: :nilify_all))
    end
  end

  def down do
    drop(constraint(:videos, "videos_category_id_fkey"))

    alter table(:videos) do
      modify(:category_id, references(:categories, on_delete: :nothing))
    end
  end
end
