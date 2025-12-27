interface PaginationInterface<T> {
  count: number
  rows: T[]
}

export class Pagination {

  page: number
  limit: number
  offset: number
  skip!: number

  constructor(page: number | string, size: number | string) {
    const parsedPage = parseInt(page as string)
    this.page = parsedPage > 0 ? parsedPage : 1

    const parsedSize = parseInt(size as string)
    this.limit = parsedSize > 0 ? parsedSize : 10

    this.offset = (this.page - 1) * this.limit
  }

  paginate<T extends object>(data: PaginationInterface<T>): any {
    const totalPages = Math.ceil(data.count / this.limit)

    const itemsWithIndex = data.rows.map((item, index) => ({
      no: this.offset + index + 1,
      ...item,
    }))

    return {
      total_items: data.count,
      total_pages: totalPages,
      current_page: this.page,
      limit: this.limit,
      items: itemsWithIndex,
      links: {
        prev:
          this.page > 1 ? `?page=${this.page - 1}&limit=${this.limit}` : null,
        next:
          this.page < totalPages
            ? `?page=${this.page + 1}&limit=${this.limit}`
            : null,
      },
    }
  }
}