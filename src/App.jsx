import './visual-upgrade.css'
// TASKFORGE_STEP5
import {
  useEffect,
  useMemo,
  useState } from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Settings,
  Sun,
  Moon,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  ListTodo,
  Trash2,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import './App.css'

const initialTasks = [
  { id: 1, title: 'Design dashboard interface', project: 'Website Redesign', priority: 'High', done: true },
  { id: 2, title: 'Build reusable React components', project: 'Development', priority: 'High', done: false },
  { id: 3, title: 'Implement responsive layouts', project: 'Development', priority: 'Medium', done: false },
  { id: 4, title: 'Test mobile navigation', project: 'Quality Assurance', priority: 'Low', done: false },
  { id: 5, title: 'Prepare deployment', project: 'Launch', priority: 'Medium', done: false }
]

const projects = [
  { name: 'Website Redesign', category: 'Design System', progress: 75, color: 'purple' },
  { name: 'Development', category: 'Engineering', progress: 48, color: 'blue' },
  { name: 'Quality Assurance', category: 'Testing', progress: 30, color: 'orange' }
]

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

function Sidebar({ active, setActive, open, setOpen }) {
  const links = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My Tasks', icon: CheckSquare },
    { name: 'Projects', icon: FolderKanban }
  ]

  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><Sparkles size={21} /></div>
          <span>taskforge<span className="brand-dot">.</span></span>
          <button className="mobile-close icon-btn" onClick={() => setOpen(false)}><X size={20}/></button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {links.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-link ${active === name ? 'active' : ''}`}
              onClick={() => { setActive(name); setOpen(false) }}
            >
              <Icon size={19} /> {name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={20} />
            <strong>Make progress daily.</strong>
            <p>Great things are built one task at a time.</p>
          </div>
          <button className={`nav-link ${active === 'Settings' ? 'active' : ''}`}
            onClick={() => { setActive('Settings'); setOpen(false) }}>
            <Settings size={19} /> Settings
          </button>
          <div className="profile">
            <div className="avatar">EF</div>
            <div><strong>Emmanuel Favor</strong><span>Workspace Admin</span></div>
          </div>
        </div>
      </aside>
    </>
  )
}

function StatCard({ title, value, icon: Icon, note, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${accent}`}><Icon size={19}/></div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}

function ProjectCard({ project, tasks, onDelete }) {
  const related = tasks.filter(t => t.project === project.name)
  const progress = related.length
    ? Math.round(related.filter(t => t.done).length / related.length * 100)
    : 0
  return (
    <article className="project-card">
      <div className="project-top">
        <div className={`project-symbol ${project.color}`}><FolderKanban size={22}/></div>
        <button className="delete-btn"
          onClick={() => onDelete(project.name)}
          aria-label={`Delete ${project.name}`}>
          <Trash2 size={17}/>
        </button>
      </div>
      <h3>{project.name}</h3>
      <p>{project.category}</p>
      <div className="progress-label"><span>Progress</span><strong>{progress}% ({related.length} tasks)</strong></div>
      <div className="progress-track"><div className={`progress-fill ${project.color}`} style={{width:`${progress}%`}}/></div>
    </article>
  )
}

function TaskList({ tasks, setTasks, search, filter }) {
  const visible = tasks.filter(task => {
    const matchesSearch = `${task.title} ${task.project}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (filter === 'All' || (filter === 'Completed' ? task.done : !task.done))
  })

  function toggle(id) {
    setTasks(previous => previous.map(task => task.id === id ? {...task, done: !task.done} : task))
  }

  function remove(id) {
    setTasks(previous => previous.filter(task => task.id !== id))
  }

  return (
    <div className="task-list">
      {visible.length === 0 ? (
        <div className="empty-state">No tasks found. Try another search or add a task.</div>
      ) : visible.map(task => (
        <div className="task-row" key={task.id}>
          <button className={`task-check ${task.done ? 'checked' : ''}`}
            onClick={() => toggle(task.id)} aria-label={`Toggle ${task.title}`}>
            {task.done && <CheckSquare size={17}/>}
          </button>
          <div className="task-info">
            <strong className={task.done ? 'completed' : ''}>{task.title}</strong>
            <span>{task.project}</span>
          </div>
          <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
          <button className="delete-btn" onClick={() => remove(task.id)} aria-label={`Delete ${task.title}`}>
            <Trash2 size={17}/>
          </button>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(() => readStorage('taskforge-theme', 'dark'))
  const [tasks, setTasks] = useState(() => readStorage('taskforge-tasks', initialTasks))
  const [projectList, setProjectList] = useState(() => readStorage('taskforge-projects', projects))
  const [showProjectAdd, setShowProjectAdd] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [selectedProject, setSelectedProject] = useState('Personal')
  const [active, setActive] = useState(() => {
    const saved = readStorage('taskforge-active-page', 'Overview')
    return ['Overview', 'My Tasks', 'Projects', 'Settings'].includes(saved)
      ? saved
      : 'Overview'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('taskforge-theme', JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    localStorage.setItem('taskforge-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('taskforge-projects', JSON.stringify(projectList))
  }, [projectList])

  function createProject(event) {
    event.preventDefault()
    const name = projectName.trim()
    if (!name || name.toLowerCase() === 'personal' ||
        projectList.some(p => p.name.toLowerCase() === name.toLowerCase())) return

    const colors = ['purple', 'blue', 'orange']
    setProjectList(previous => [...previous, {
      name,
      category: 'Workspace project',
      color: colors[previous.length % colors.length]
    }])
    setProjectName('')
    setShowProjectAdd(false)
  }

  function deleteProject(name) {
    if (tasks.some(t => t.project === name) &&
        !window.confirm(`Delete ${name}? Its tasks will move to Personal.`)) return

    setTasks(previous => previous.map(t =>
      t.project === name ? {...t, project: 'Personal'} : t
    ))
    setProjectList(previous => previous.filter(p => p.name !== name))
    setSelectedProject(previous => previous === name ? 'Personal' : previous)
  }

  useEffect(() => {
    localStorage.setItem('taskforge-active-page', JSON.stringify(active))
  }, [active])

  const completed = useMemo(() => tasks.filter(t => t.done).length, [tasks])
  const pending = tasks.length - completed
  const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0

  function addTask(event) {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setTasks(previous => [{
      id: Date.now() + Math.random(),
      title,
      project: selectedProject,
      priority: 'Medium',
      done: false
    }, ...previous])
    setNewTitle('')
    setShowAdd(false)
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} open={sidebarOpen} setOpen={setSidebarOpen}/>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={22}/></button>
            <span className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className="avatar small">EF</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="status-dot"/> YOUR WORKSPACE, AT A GLANCE</div>
              <h1>{active === 'Overview' ? 'Good to have you here.' : active}</h1>
              <p>{active === 'Overview' ? "Here's what's happening with your work today." : 'Stay organized and keep your momentum going.'}</p>
            </div>
            <button className="primary-btn" onClick={() => setShowAdd(true)}><Plus size={18}/> New task</button>
          </div>

          {(active === 'Overview' || active === 'Settings') && (
            <div className="welcome-banner">
              <div>
                <div className="banner-kicker">
        <div className="taskforge-hero-art" aria-hidden="true">
          <div className="taskforge-orbit taskforge-orbit-one" />
          <div className="taskforge-orbit taskforge-orbit-two" />
          <div className="taskforge-floating-card taskforge-card-top">
            <Sparkles size={18} />
            <span>CREATE</span>
          </div>
          <div className="taskforge-floating-card taskforge-card-main">
            <CheckCircle2 size={44} strokeWidth={1.6} />
          </div>
          <div className="taskforge-floating-card taskforge-card-bottom">
            <CheckCircle2 size={16} />
            <span>ON TRACK</span>
          </div>
        </div>
<Sparkles size={15}/> PRODUCTIVITY, REIMAGINED</div>
                <h2>Stay focused. Make it happen.</h2>
                <p>Everything you need to organize your work and turn plans into progress.</p>
              </div>
              <div className="banner-art"><div className="art-ring"><CheckCircle2 size={54}/></div></div>
            </div>
          )}

          {active !== 'Settings' && (
            <div className="stats-grid">
              <StatCard title="Total Tasks" value={tasks.length.toString().padStart(2,'0')} icon={ListTodo} note="Across your workspace" accent="violet"/>
              <StatCard title="Completed" value={completed.toString().padStart(2,'0')} icon={CheckCircle2} note={`${percentage}% completion rate`} accent="green"/>
              <StatCard title="In Progress" value={pending.toString().padStart(2,'0')} icon={Clock3} note="Tasks awaiting completion" accent="orange"/>
              <StatCard title="Projects" value={projectList.length.toString().padStart(2,'0')} icon={FolderKanban} note="Active workstreams" accent="blue"/>
            </div>
          )}

          {(active === 'Overview' || active === 'Projects') && (
            <section className="section">
              <div className="section-heading">
                <div><h2>Active projects</h2><p>A snapshot of what you're working on.</p></div>
                <button className="secondary-btn" onClick={() => setShowProjectAdd(true)}>
          <Plus size={16}/> New project
        </button>
              </div>
              <div className="projects-grid">
          {projectList.map(project =>
            <ProjectCard key={project.name} project={project}
              tasks={tasks} onDelete={deleteProject}/>
          )}
          {projectList.length === 0 && <p>No projects yet.</p>}
        </div>
            </section>
          )}

          {(active === 'Overview' || active === 'My Tasks') && (
            <section className="section tasks-section">
              <div className="section-heading">
                <div><h2>Your tasks</h2><p>Keep track of what matters most.</p></div>
                <span className="section-count">{tasks.length} TASKS</span>
              </div>
              <div className="tasks-panel">
                <div className="task-toolbar">
                  <div className="filters">
                    {['All','Pending','Completed'].map(item => (
                      <button key={item} className={filter === item ? 'filter-active' : ''}
                        onClick={() => setFilter(item)}>{item}</button>
                    ))}
                  </div>
                  <div className="search-field"><Search size={17}/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."/>
                  </div>
                </div>
                <TaskList tasks={tasks} setTasks={setTasks} search={search} filter={filter}/>
              </div>
            </section>
          )}

          {active === 'Settings' && (
            <section className="settings-panel">
              <h2>Appearance</h2>
              <p>Choose how TaskForge looks on your device.</p>
              <div className="theme-options">
                <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon size={20}/> Dark mode</button>
                <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun size={20}/> Light mode</button>
              </div>
            </section>
          )}

          <footer className="footer"><span>TaskForge © 2026</span><span>Built for Codveda Level 2</span></footer>
        </div>
      </main>

      {showProjectAdd && (
        <div className="modal-backdrop" onClick={() => setShowProjectAdd(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={createProject}>
            <div className="modal-heading">
              <h2>Create a project</h2>
              <button type="button" className="icon-btn"
                onClick={() => setShowProjectAdd(false)}><X size={20}/></button>
            </div>
            <label htmlFor="project-name">Project name</label>
            <input id="project-name" autoFocus required maxLength={60}
              value={projectName} onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Client website"/>
            <button className="primary-btn modal-submit" type="submit">
              <Plus size={18}/> Create project
            </button>
          </form>
        </div>
      )}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal" onClick={e => e.stopPropagation()} onSubmit={addTask}>
            <div className="modal-heading"><h2>Create a task</h2><button type="button" className="icon-btn" onClick={() => setShowAdd(false)}><X size={20}/></button></div>
            <label htmlFor="task-title">Task name</label>
            <input id="task-title" autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What needs to be done?" maxLength={120}/>
            <label htmlFor="task-project" className="field-label">Project</label>
            <select id="task-project" className="modal-select"
              value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="Personal">Personal</option>
              {projectList.map(project =>
                <option key={project.name} value={project.name}>{project.name}</option>
              )}
            </select>
            <button className="primary-btn modal-submit" type="submit"><Plus size={18}/> Add task</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
