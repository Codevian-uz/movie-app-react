import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from '@/lib/i18n'

interface ProcessingStateProps {
  progress?: number | undefined
}

export function ProcessingState({ progress }: ProcessingStateProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-400px flex w-full flex-col items-center justify-center gap-6 rounded-xl bg-black/40 p-8 backdrop-blur-md">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="text-primary"
      >
        <Loader2 size={64} className="animate-pulse" />
      </motion.div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-white">{t('catalog.watch.preparing')}</h2>
        <p className="text-muted-foreground max-w-md">{t('catalog.watch.transcoding')}</p>
      </div>

      {progress !== undefined && (
        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-right text-xs font-medium text-white/60">{progress}%</p>
        </div>
      )}
    </div>
  )
}
