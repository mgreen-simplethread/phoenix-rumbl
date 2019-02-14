defmodule RumblWeb.WatchController do
  use RumblWeb, :controller

  alias Rumbl.Multimedia

  def index(conn, _params) do
    videos = Multimedia.list_videos()
    render(conn, "index.html", videos: videos)
  end

  def show(conn, %{"id" => id}) do
    video = Multimedia.get_video!(id)
    render(conn, "show.html", video: video)
  end
end
