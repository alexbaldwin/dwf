'use client'

import { useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Draggable from 'react-draggable'

export default function AnimatedWindow({
  isVisible,
  isDraggable,
  nodeRef,
  position,
  onPositionChange,
  onActivate,
  zIndex,
  className,
  children
}) {
  const reduceMotion = useReducedMotion()
  const handleDrag = useCallback(
    (_event, data) => {
      onPositionChange({ x: data.x, y: data.y })
    },
    [onPositionChange]
  )

  const handleStop = useCallback(
    (_event, data) => {
      onPositionChange({ x: data.x, y: data.y })
    },
    [onPositionChange]
  )

  return (
    <Draggable
      handle=".handle"
      position={position}
      onDrag={handleDrag}
      onStop={handleStop}
      grid={[1, 1]}
      nodeRef={nodeRef}
      disabled={!isVisible || !isDraggable}
      bounds="parent"
      cancel="[data-no-drag], input, textarea, button, select, a"
    >
      <div
        ref={nodeRef}
        className={className}
        aria-hidden={!isVisible}
        inert={isVisible ? undefined : true}
        onPointerDown={onActivate}
        style={{
          zIndex,
          pointerEvents: isVisible ? 'auto' : 'none',
          display: isVisible ? undefined : 'none'
        }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isVisible ? 1 : 0.94,
            opacity: isVisible ? 1 : 0
          }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
        >
          {children}
        </motion.div>
      </div>
    </Draggable>
  )
}
