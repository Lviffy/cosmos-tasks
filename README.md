# Cosmos Tasks 🌌

A modern, space-themed kanban board application for task management and project organization.

## ✨ Features

- **Drag & Drop Interface**: Intuitive kanban board with smooth drag-and-drop functionality
- **Real-time Collaboration**: Powered by Supabase for real-time updates
- **Beautiful UI**: Built with shadcn/ui components and Tailwind CSS
- **Dark/Light Theme**: Toggle between themes with next-themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Form Validation**: Robust form handling with React Hook Form and Zod
- **Data Visualization**: Charts and analytics with Recharts
- **Notifications**: Toast notifications with Sonner

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lviffy/cosmos-tasks.git
   cd cosmos-tasks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🗄️ Database Setup

This application uses Supabase as the backend. You'll need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up your database tables for tasks, boards, and users
3. Configure Row Level Security (RLS) policies
4. Add your Supabase URL and anon key to your environment variables

## 🎨 UI Components

The application leverages a comprehensive set of Radix UI components through shadcn/ui:

- Dialogs and Modals
- Dropdown Menus
- Form Controls
- Navigation Components
- Data Display Components
- Feedback Components

## 📱 Features Overview

### Kanban Board
- Create, edit, and delete task boards
- Add tasks with descriptions, due dates, and priorities
- Move tasks between columns (To Do, In Progress, Done)
- Real-time updates across all connected clients

### Task Management
- Rich task details with markdown support
- Priority levels and due dates
- Task assignment and collaboration
- Activity tracking and history

### Responsive Design
- Mobile-first approach
- Touch-friendly drag and drop
- Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and real-time features by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ and ☕ by [Lviffy](https://github.com/Lviffy)**
