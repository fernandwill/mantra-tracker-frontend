'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAchievements, Achievement } from '@/lib/achievements-service'
import { Trophy, Lock } from 'lucide-react'

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setAchievements(getAchievements())
  }, [])

  const earnedAchievements = achievements.filter(a => a.earned)
  const lockedAchievements = achievements.filter(a => !a.earned)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <p className="text-muted-foreground">
          {earnedAchievements.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Unlocked Achievements
            </CardTitle>
            <CardDescription>
              Celebrate your mindfulness milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center p-4 rounded-lg border bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10"
                >
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Lock className="w-5 h-5 mr-2 text-muted-foreground" />
              Locked Achievements
            </CardTitle>
            <CardDescription>
              Continue your practice to unlock these milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center p-4 rounded-lg border bg-muted/30 opacity-70"
                >
                  <div className="text-2xl mr-3 text-muted-foreground">🔒</div>
                  <div>
                    <h3 className="font-semibold text-muted-foreground">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}