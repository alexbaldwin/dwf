'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import Draggable from 'react-draggable'

export default function AnimatedWindow({ isVisible, nodeRef, position, onPositionChange, children }) {
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
      disabled={!isVisible}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        aria-hidden={!isVisible}
        inert={isVisible ? undefined : true}
        style={{
          position: 'absolute',
          zIndex: 500,
          pointerEvents: isVisible ? 'auto' : 'none',
          visibility: isVisible ? 'visible' : 'hidden'
        }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: isVisible ? 1 : 0.94,
            opacity: isVisible ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </Draggable>
  )
}
