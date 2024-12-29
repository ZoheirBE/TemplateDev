import * as React from "react"
import { cn } from "@/lib/utils"
import { IconProps } from "@radix-ui/react-icons/dist/types"
import { FileIcon, FolderIcon, FileTextIcon } from "lucide-react"

export interface TreeItem {
  id: string
  name: string
  children?: TreeItem[]
  type: "file" | "folder"
  icon?: React.FC<IconProps>
}

interface TreeProps {
  data: TreeItem[]
  onSelect?: (item: TreeItem) => void
  selectedId?: string
}

interface TreeNodeProps extends TreeItem {
  level: number
  onSelect?: (item: TreeItem) => void
  selectedId?: string
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.xml')) return FileTextIcon
  return FileIcon
}

const TreeNode: React.FC<TreeNodeProps> = ({
  id,
  name,
  children,
  level,
  type,
  onSelect,
  selectedId,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const Icon = type === 'folder' ? FolderIcon : getFileIcon(name)
  const isSelected = id === selectedId

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50",
          isSelected && "bg-accent",
          level > 0 && "ml-4"
        )}
        onClick={() => {
          if (type === 'folder') {
            setIsOpen(!isOpen)
          }
          onSelect?.({ id, name, type, children })
        }}
      >
        <Icon className="h-4 w-4 mr-2" />
        <span className="text-sm">{name}</span>
      </div>
      {isOpen && children?.map((child) => (
        <TreeNode
          key={child.id}
          {...child}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  )
}

export const Tree: React.FC<TreeProps> = ({
  data,
  onSelect,
  selectedId,
}) => {
  return (
    <div className="select-none">
      {data.map((item) => (
        <TreeNode
          key={item.id}
          {...item}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  )
}

export default Tree
