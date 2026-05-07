import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Todo {
  id: bigint;
  text: string;
  completed: boolean;
}

export default function App() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");

  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as { getTodos: () => Promise<Todo[]> }
      ).getTodos();
    },
    enabled: !!actor && !isFetching,
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!actor) return;
      await (
        actor as unknown as { addTodo: (t: string) => Promise<void> }
      ).addTodo(text);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await (
        actor as unknown as { toggleTodo: (id: bigint) => Promise<void> }
      ).toggleTodo(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) return;
      await (
        actor as unknown as { deleteTodo: (id: bigint) => Promise<void> }
      ).deleteTodo(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  });

  function handleAdd() {
    const text = inputValue.trim();
    if (!text) return;
    addMutation.mutate(text);
    setInputValue("");
  }

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          Todos
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            data-ocid="todo.input"
            className="flex-1 border border-input rounded-md px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add a todo…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            type="button"
            data-ocid="todo.add_button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
            onClick={handleAdd}
            disabled={addMutation.isPending || !inputValue.trim()}
          >
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {completedCount} of {todos.length} completed
          </p>
        )}

        {todos.length === 0 ? (
          <div
            data-ocid="todo.empty_state"
            className="text-center text-muted-foreground py-12"
          >
            No todos yet. Add one above!
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo, i) => (
              <li
                key={String(todo.id)}
                data-ocid={`todo.item.${i + 1}`}
                className="flex items-center gap-3 bg-card border border-border rounded-md px-3 py-2"
              >
                <input
                  type="checkbox"
                  data-ocid={`todo.checkbox.${i + 1}`}
                  checked={todo.completed}
                  onChange={() => toggleMutation.mutate(todo.id)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  data-ocid={`todo.delete_button.${i + 1}`}
                  onClick={() => deleteMutation.mutate(todo.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete todo"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
