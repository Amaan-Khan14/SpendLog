import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useForm } from '@tanstack/react-form'
import type { FieldApi } from '@tanstack/react-form'
import { api, fetchAllExpensesQueryOptions } from "../../lib/api";
import { ReloadIcon } from "@radix-ui/react-icons"
import { format, parse, isValid } from 'date-fns';
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createExpense } from "../../../../server/validation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
// import { toast } from "../../components/ui/sonner";


export const Route = createFileRoute("/_authenticated/createExpense")({
  component: createExpenses,
});


function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      <div className="text-zinc-300/80 text-sm text-starts">
        {field.state.meta.isValidating ? 'Validating...' : null}
      </div>
    </>
  )
}


function createExpenses() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      title: '',
      amount: 0,
      date: new Date(),
      userId: '1'
    }, onSubmit: async ({ value }) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const existingExpenses = await queryClient.ensureQueryData(fetchAllExpensesQueryOptions)
        const res = await api.expenses.$post({ json: value })

        if (!res.ok) {
          throw new Error('Failed to create expense')
        }

        const newExpense = await res.json()
        queryClient.setQueryData(fetchAllExpensesQueryOptions.queryKey, {
          ...existingExpenses,
          expense: [newExpense.expense, ...existingExpenses.expense]
        })

        toast('Success', {
          description: `Expense created successfully ${value.title}`
        })

        navigate({ to: '/expenses' })
      } catch (error) {
        console.error('Error creating expense:', error)
        toast('Error', {
          description: error instanceof Error ? error.message : `Failed to create expense ${value.title}`
        })
      }
    },
  })
  return (
    <div>
      <div className="absolute w-screen flex items-center justify-center">
        <Card className="relative bg-page-gradient [box-shadow:0_-20px_80px_-20px_#8686f01f_inset] mt-36 w-2/5 h-1/2 shadow-2xl border-2 border-white/5 text-md font-geistSans ">
          <div className="bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          <section className="m-16">
            <form onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}>
              <div>
                <form.Field
                  name="title"
                  validatorAdapter={zodValidator()}
                  validators={{
                    onChange: createExpense.shape.title,
                  }}
                  children={(field) => {
                    // Avoid hasty abstractions. Render props are great!
                    return (
                      <>
                        <Label className="bg-gradient-to-tr from-zinc-100 via-zinc-200/50 to-zinc-200/90 text-transparent bg-clip-text text-lg">Title</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)
                          }
                          className="my-2 bg-transparent/10 border-2 border-white/30 text-white text-lg focus:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset] focus:border-white/50"
                        />
                        <FieldInfo field={field} />
                      </>
                    )
                  }}
                />
              </div>
              <div>
                <form.Field
                  name="amount"
                  validatorAdapter={zodValidator()}
                  validators={{
                    onChange: createExpense.shape.amount,
                  }}
                  children={(field) => {
                    // Avoid hasty abstractions. Render props are great!
                    return (
                      <>
                        <Label className="bg-gradient-to-tr from-zinc-100 via-zinc-200/50 to-zinc-200/90 text-transparent bg-clip-text text-lg">Amount</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          type="number"
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          className="my-2 bg-transparent/10 border-2 border-white/30 text-white text-lg focus:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset] focus:border-white/50"
                        />
                        <FieldInfo field={field} />
                      </>
                    )
                  }}
                />
              </div>
              <div>
                <form.Field
                  name="date"
                  validatorAdapter={zodValidator()}
                  validators={{
                    onChange: createExpense.shape.date,
                  }}
                  children={(field) => {
                    // Avoid hasty abstractions. Render props are great!
                    return (
                      <>
                        <Label className="bg-gradient-to-tr from-zinc-100 via-zinc-200/50 to-zinc-200/90 text-transparent bg-clip-text text-lg">Date</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value ? format(new Date(field.state.value), 'yyyy-MM-dd') : ''}
                          onBlur={field.handleBlur}
                          type="date"
                          onChange={(e) => {
                            const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
                            if (isValid(date)) {
                              field.handleChange(date);
                            } else {
                              field.handleChange(new Date());
                            }
                          }}
                          className="my-2 w-full bg-transparent/10 border-2 border-white/30 text-white text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 hover:border-white/40 transition-all duration-200 placeholder-white/50"
                        />
                        <FieldInfo field={field} />
                      </>
                    )
                  }}
                />
              </div>
              <div>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" className="text-lg my-2 mx-56 px-10 relative text-zinc-100 bg-page-gradient border-white/30 text-md font-geistSans hover:border-zinc-600 hover:bg-transparent/20 hover:shadow-inner hover:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset] hover:text-white" disabled={!canSubmit} variant="outline">
                      {isSubmitting ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                  )}
                />
              </div>
            </form>
          </section>
        </Card>
      </div>
    </div >)
}
