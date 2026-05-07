import List "mo:core/List";

actor {
  public type Todo = { id : Nat; text : Text; completed : Bool };

  let todos = List.empty<Todo>();
  let state = { var nextId : Nat = 0 };

  public func addTodo(text : Text) : async Nat {
    let id = state.nextId;
    state.nextId += 1;
    todos.add({ id; text; completed = false });
    id;
  };

  public query func getTodos() : async [Todo] {
    todos.toArray();
  };

  public func toggleTodo(id : Nat) : async () {
    todos.mapInPlace(
      func(todo) {
        if (todo.id == id) { { todo with completed = not todo.completed } } else { todo };
      }
    );
  };

  public func deleteTodo(id : Nat) : async () {
    let kept = todos.filter(func(todo) { todo.id != id });
    todos.clear();
    todos.addAll(kept.values());
  };
};
