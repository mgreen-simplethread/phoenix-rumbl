defmodule Rumbl.Counter do
  @moduledoc """
  A simple counter service written as a persistent Process. Uses immutability and recursion to maintain the value
  of a numeric counter, which runs in an isolated process and is interacted with via messages from its parent
  """

  use GenServer

  @doc """
  Increment the counter's value
  """
  def inc(pid), do: GenServer.cast(pid, :inc)

  @doc """
  Decrement the counter's value
  """
  def dec(pid), do: GenServer.cast(pid, :dec)

  @doc """
  Request the current counter value
  """
  def val(pid) do
    GenServer.call(pid, :val)
  end

  @doc """
  Start the counter process with an initial value
  """
  def start_link(initial_val) do
    GenServer.start_link(__MODULE__, initial_val)
  end

  def init(initial_val) do
    {:ok, initial_val}
  end

  def handle_cast(:inc, val) do
    {:noreply, val + 1}
  end

  def handle_cast(:dec, val) do
    {:noreply, val - 1}
  end

  def handle_call(:val, _from, val) do
    {:reply, val, val}
  end
end
