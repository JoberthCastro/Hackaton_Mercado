import { useState, useCallback, useMemo } from 'react'
import { Star, Check } from 'lucide-react'
import { QUESTIONNAIRE, ANIMATION } from '../utils/constants'
import type {
  QuestionType,
  QuestionnaireAnswers,
  AttendanceRating,
  ProductRating,
  PriceRating,
  QuestionOption,
} from '../types/questionnaire'

const QUESTIONS_ORDER: QuestionType[] = ['rating', 'attendance', 'product', 'price', 'return']

const ATTENDANCE_OPTIONS: QuestionOption<AttendanceRating>[] = [
  { value: 'ruim', label: 'Ruim' },
  { value: 'regular', label: 'Regular' },
  { value: 'bom', label: 'Bom' },
  { value: 'otimo', label: 'Ótimo' },
]

const PRODUCT_OPTIONS: QuestionOption<ProductRating>[] = [
  { value: 'ruim', label: 'Ruim' },
  { value: 'regular', label: 'Regular' },
  { value: 'bom', label: 'Bom' },
  { value: 'otimo', label: 'Ótimo' },
]

const PRICE_OPTIONS: QuestionOption<PriceRating>[] = [
  { value: 'caro', label: 'Caro' },
  { value: 'justo', label: 'Justo' },
  { value: 'bom', label: 'Bom' },
]

const RETURN_OPTIONS: QuestionOption<boolean>[] = [
  { value: false, label: 'Não' },
  { value: true, label: 'Sim' },
]

const INITIAL_ANSWERS: QuestionnaireAnswers = {
  rating: null,
  attendance: null,
  product: null,
  price: null,
  return: null,
}

export function ReviewsPage() {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType>('rating')
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(INITIAL_ANSWERS)

  const currentIndex = useMemo(() => QUESTIONS_ORDER.indexOf(currentQuestion), [currentQuestion])

  const handleAnswer = useCallback(
    (value: number | AttendanceRating | ProductRating | PriceRating | boolean) => {
      const questionKey = currentQuestion as keyof QuestionnaireAnswers
      setAnswers((prev) => ({ ...prev, [questionKey]: value }))

      // Avança para próxima pergunta após um pequeno delay
      setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex < QUESTIONS_ORDER.length) {
          setCurrentQuestion(QUESTIONS_ORDER[nextIndex])
        } else {
          setCurrentQuestion('completed')
        }
      }, QUESTIONNAIRE.TRANSITION_DELAY_MS)
    },
    [currentQuestion, currentIndex],
  )

  const handleRatingClick = useCallback(
    (rating: number) => handleAnswer(rating),
    [handleAnswer],
  )

  const handleReturnClick = useCallback(
    (value: boolean) => handleAnswer(value),
    [handleAnswer],
  )

  const resetQuestionnaire = useCallback(() => {
    setCurrentQuestion('rating')
    setAnswers(INITIAL_ANSWERS)
  }, [])

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-card bg-white shadow-elevated">
          {/* Container com animação de slide */}
          <div
            className="relative flex transition-transform ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transitionDuration: `${ANIMATION.SLIDE_TRANSITION_MS}ms`,
            }}
          >
            {/* Pergunta 1: Avaliação geral (estrelas) */}
            <QuestionSlide question="Avaliação geral da barraca" questionNumber={1}>
              <div className="flex justify-center gap-2 sm:gap-4">
                {Array.from({ length: QUESTIONNAIRE.MAX_STARS }, (_, i) => i + 1).map((star) => (
                  <StarButton
                    key={star}
                    star={star}
                    selectedRating={answers.rating}
                    onClick={() => handleRatingClick(star)}
                  />
                ))}
              </div>
            </QuestionSlide>

            {/* Pergunta 2: Atendimento */}
            <QuestionSlide question="Atendimento" questionNumber={2}>
              <OptionGrid columns={{ mobile: 2, desktop: 4 }}>
                {ATTENDANCE_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    label={option.label}
                    isSelected={answers.attendance === option.value}
                    onClick={() => handleAnswer(option.value)}
                  />
                ))}
              </OptionGrid>
            </QuestionSlide>

            {/* Pergunta 3: Produto */}
            <QuestionSlide question="Produto" questionNumber={3}>
              <OptionGrid columns={{ mobile: 2, desktop: 4 }}>
                {PRODUCT_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    label={option.label}
                    isSelected={answers.product === option.value}
                    onClick={() => handleAnswer(option.value)}
                  />
                ))}
              </OptionGrid>
            </QuestionSlide>

            {/* Pergunta 4: Preço */}
            <QuestionSlide question="Preço" questionNumber={4}>
              <OptionGrid columns={{ mobile: 1, desktop: 3 }}>
                {PRICE_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value}
                    label={option.label}
                    isSelected={answers.price === option.value}
                    onClick={() => handleAnswer(option.value)}
                  />
                ))}
              </OptionGrid>
            </QuestionSlide>

            {/* Pergunta 5: Voltar a comprar */}
            <QuestionSlide question="Você voltaria a comprar aqui?" questionNumber={5}>
              <OptionGrid columns={{ mobile: 2, desktop: 2 }}>
                {RETURN_OPTIONS.map((option) => (
                  <OptionButton
                    key={option.value.toString()}
                    label={option.label}
                    isSelected={answers.return === option.value}
                    onClick={() => handleReturnClick(option.value)}
                  />
                ))}
              </OptionGrid>
            </QuestionSlide>
          </div>

          {/* Tela de agradecimento */}
          {currentQuestion === 'completed' && (
            <CompletionScreen onReset={resetQuestionnaire} />
          )}
        </div>
      </div>
    </div>
  )
}

function StarButton({
  star,
  selectedRating,
  onClick,
}: {
  star: number
  selectedRating: number | null
  onClick: () => void
}) {
  const isSelected = selectedRating !== null && star <= selectedRating

  return (
    <button
      onClick={onClick}
      className="group transition-transform hover:scale-110 active:scale-95"
      aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
    >
      <Star
        className={`h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 transition-colors ${
          isSelected
            ? 'fill-accent-500 text-accent-500'
            : 'fill-gray-200 text-gray-300 group-hover:fill-accent-300 group-hover:text-accent-300'
        }`}
      />
    </button>
  )
}

function QuestionSlide({
  question,
  questionNumber,
  children,
}: {
  question: string
  questionNumber: number
  children: React.ReactNode
}) {
  const progressPercentage = Math.round((questionNumber / QUESTIONNAIRE.TOTAL_QUESTIONS) * 100)

  return (
    <div className="flex min-w-full flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
      {/* Indicador de progresso */}
      <div className="mb-6 w-full max-w-md sm:mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500 sm:text-base">
          <span>
            Pergunta {questionNumber} de {QUESTIONNAIRE.TOTAL_QUESTIONS}
          </span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{
              width: `${progressPercentage}%`,
              transitionDuration: `${ANIMATION.PROGRESS_BAR_MS}ms`,
            }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl lg:text-4xl">
        {question}
      </h2>

      {/* Opções de resposta */}
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  )
}

function OptionGrid({
  columns,
  children,
}: {
  columns: { mobile: number; desktop: number }
  children: React.ReactNode
}) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  } as const

  return (
    <div
      className={`grid ${gridClasses[columns.mobile as keyof typeof gridClasses]} gap-3 sm:gap-4 sm:${gridClasses[columns.desktop as keyof typeof gridClasses]}`}
    >
      {children}
    </div>
  )
}

function OptionButton({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-institutional border-2 px-6 py-4 text-base font-semibold transition-all sm:px-8 sm:py-5 sm:text-lg lg:px-10 lg:py-6 lg:text-xl ${
        isSelected
          ? 'border-primary-600 bg-primary-600 text-white shadow-card'
          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 active:scale-95'
      }`}
      style={{ transitionDuration: `${ANIMATION.BUTTON_TRANSITION_MS}ms` }}
    >
      {label}
    </button>
  )
}

function CompletionScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-light sm:h-24 sm:w-24">
          <Check className="h-12 w-12 text-success-dark sm:h-16 sm:w-16" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          Obrigado!
        </h2>
        <p className="mb-8 text-lg text-gray-600 sm:text-xl lg:text-2xl">
          Sua avaliação foi registrada com sucesso.
        </p>
        <button
          onClick={onReset}
          className="rounded-institutional bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-card transition-colors hover:bg-primary-700 active:bg-primary-800 sm:px-10 sm:py-4 sm:text-lg"
        >
          Nova Avaliação
        </button>
      </div>
    </div>
  )
}
