import { CategoryList } from '../components/CategoryList'

export default function ConfigPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
      <h1 className="text-xl font-semibold">Configurações</h1>
      <CategoryList />
    </div>
  )
}
