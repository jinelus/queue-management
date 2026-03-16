'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { SearchIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'
import z from 'zod'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { Input } from '../ui/input'

const searchSchema = z.object({
  search: z.string().optional(),
})

type SearchFormData = z.infer<typeof searchSchema>

interface SearchInputProps {
  placeholder?: string
}

export const SearchInput: FC<SearchInputProps> = ({ placeholder }) => {
  const [search, setSearch] = useQueryState(
    'q',
    parseAsString.withOptions({
      shallow: false,
      clearOnDefault: false,
    }),
  )

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: search ?? '',
    },
  })

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
  }, 600)

  const onSubmit = (data: SearchFormData) => {
    setSearch(data?.search ?? '')
  }

  useEffect(() => {
    if (search !== form.getValues('search')) {
      form.setValue('search', search ?? '')
    }
  }, [search, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex items-center gap-2">
                  <SearchIcon className="absolute left-3 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={placeholder ?? 'Search...'}
                    className="pl-10"
                    onChange={(e) => {
                      field.onChange(e)
                      debouncedSetSearch(e.target.value)
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
