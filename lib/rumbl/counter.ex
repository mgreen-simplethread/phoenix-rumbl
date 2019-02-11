defmodule Rumbl.Counter do
  @moduledoc """
  A simple counter service written as a persistent Process. Uses immutability and recursion to maintain the value
  of a numeric counter, which runs in an isolated process and is interacted with via messages from its parent
  """

  @doc """
  Increment the counter's value
  """
  def inc(pid), do: send(pid, :inc)

  @doc """
  Decrement the counter's value
  """
  def dec(pid), do: send(pid, :dec)

  @doc """
  Request the current counter value
  """
  def val(pid, timeout \\ 5000) do
    ref = make_ref()
    send(pid, {:val, self(), ref})

    receive do
      {^ref, val} -> val
    after
      timeout -> exit(:timeout)
    end
  end

  @doc """
  Start the counter process with an initial value
  """
  def start_link(initial_val) do
    {:ok, spawn_link(fn -> listen(initial_val) end)}
  end

  defp listen(val) do
    receive do
      :inc ->
        listen(val + 1)
      :dec ->
        listen(val - 1)
      {:val, sender, ref} ->
        send(sender, {ref, val})
        listen(val)
    end
  end
end
