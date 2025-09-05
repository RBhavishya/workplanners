import React, { useState, useEffect } from "react";

type AddTaskFormProps = {
  open: boolean
  onClose: () => void
}

const AddTaskForm = ({ open, onClose }: AddTaskFormProps) => {
  if (!open) return null;
  const [title, setTitle] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([""]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  //  edit subtasks
  const handleSubtaskChange = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  // Add subtasks
  const addSubtask = () => {
    setSubtasks([...subtasks, ""]);
  };

  // Remove a subtask
  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = {
      title,
      subtasks: subtasks.filter((st) => st.trim() !== ""),
      projectId: selectedProject,
    };

    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        alert("Task created successfully!");
        setTitle("");
        setSubtasks([""]);
        setSelectedProject("");
      } else {
        alert("Error creating task");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Add Task</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Subtasks */}
      <div>
        <h3 className="font-semibold mb-2">Subtasks</h3>
        {subtasks.map((st, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={st}
              onChange={(e) => handleSubtaskChange(index, e.target.value)}
              placeholder={`Subtask ${index + 1}`}
              className="flex-1 p-2 border rounded"
            />
            {subtasks.length > 1 && (
              <button
                type="button"
                onClick={() => removeSubtask(index)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSubtask}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          + Add Subtask
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full p-2 bg-green-600 text-white rounded"
      >
        Save Task
      </button>
    </form>
  );
};

export default AddTaskForm;
