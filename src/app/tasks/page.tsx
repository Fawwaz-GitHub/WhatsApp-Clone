"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const TasksPage = () => {
  const tasks = useQuery(api.tasks.getTasks);
  const deletion = useMutation(api.tasks.deleteTask)
  return (
    <div className="flex min-h-screen flex-col p-24">
      {tasks?.map(({ _id, text }) => <div key={_id}>{text}
        <button onClick={() => deletion({ id: _id }) }>Delete</button>
    </div>)}
    </div>
  );
}

export default TasksPage;

