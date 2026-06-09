"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendUpIcon, TrendDownIcon } from "@phosphor-icons/react"

export function SectionCards({
  totalRevenue = 1250,
  invoicesCount = 12,
  quotationsCount = 8,
  clientsCount = 4,
}: {
  totalRevenue?: number
  invoicesCount?: number
  quotationsCount?: number
  clientsCount?: number
}) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            KES {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              +100%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Paid invoices revenue{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Lifetime accumulated revenue
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Invoices</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {invoicesCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Generated invoices count{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Draft and finalized invoices
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Quotations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {quotationsCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Generated quotations count{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Price estimates provided
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {clientsCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendUpIcon />
              Registered
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique customer profiles{" "}
            <TrendUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Saved clients database
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
