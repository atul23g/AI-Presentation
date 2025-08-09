import React, { useRef } from 'react'
import { OutlineCard } from '@/lib/types'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card as UICard } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

type Props = {
  card: OutlineCard
  isEditing: boolean
  isSelected: boolean
  editText: string
  onEditChange: (value: string) => void
  onEditBlur: () => void
  onEditKeyDown: (e: React.KeyboardEvent) => void
  onCardClick: () => void
  onCardDoubleClick: () => void
  onDeleteClick: () => void
  dragHandlers: React.HTMLAttributes<HTMLDivElement>
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  dragOverStyles: React.CSSProperties
}

const Card = ({
  card,
  isEditing,
  isSelected,
  editText,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onCardClick,
  onCardDoubleClick,
  onDeleteClick,
  dragHandlers,
  onDragOver,
  dragOverStyles,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
      className="relative"
    >
      <div
        draggable
        onDragOver={onDragOver}
        style={dragOverStyles}
        {...dragHandlers}
      >
        <UICard
          className={`p-4 cursor-grab active:cursor-grabbing bg-primary-90 ${
            isEditing || isSelected ? 'border-primary bg-transparent' : ''
          }`}
          onClick={onCardClick}
          onDoubleClick={onCardDoubleClick}
        >
          <div className="flex items-center gap-4">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editText}
                onChange={(e) => onEditChange(e.target.value)}
                onBlur={onEditBlur}
                onKeyDown={onEditKeyDown}
                className="text-base sm:text-lg"
              />
            ) : (
              <>
                <div className="flex items-center gap-4 w-full">
                  <span
                    className={`flex items-center justify-center w-12 h-12 sm:w-12 sm:h-12 rounded-xl bg-primary-20 text-base sm:text-lg font-semibold ${
                      isEditing || isSelected
                        ? 'bg-secondary-90 dark:text-black'
                        : ''
                    }`}
                  >
                    {card.order}
                  </span>
                  <span className="text-base sm:text-lg leading-relaxed break-words">
                    {card.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteClick()
                    }}
                    aria-label={`Delete card ${card.order}`}
                  >
                    <Trash2 className='w-4 h-4'></Trash2>
                  </Button>
                </div>
              </>
            )}
          </div>
        </UICard>
      </div>
    </motion.div>
  )
}

export default Card