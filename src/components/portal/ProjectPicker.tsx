/** One control shared by every portal page for choosing which project you are in. */
export function ProjectPicker({
  projects,
  activeId,
  onSelect,
}: {
  projects: Array<{ id: string; name: string }> | undefined;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="active-project" className="label-caps text-muted-foreground">
        Project
      </label>
      <select
        id="active-project"
        value={activeId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="max-w-full rounded-full border border-input bg-background px-4 py-2 text-sm"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
