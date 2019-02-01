defmodule Rumbl.Accounts do
  @moduledoc """
  The Accounts context. This is a wrapper around the actual User model that abstracts away any direct usage of the
  Rumbl.Repo module. It's used to make our app more storage agnostic.
  """

  alias Rumbl.Repo
  alias Rumbl.Accounts.User

  def get_user(id) do
    Repo.get(User, id)
  end

  def get_user!(id) do
    Repo.get!(User, id)
  end

  def get_user_by(params) do
    Repo.get_by(User, params)
  end

  def list_users do
    Repo.all(User)
  end

  def change_user(%User{} = user) do
    User.changeset(user, %{})
  end
end
