#!/usr/bin/env ruby
# frozen_string_literal: true

# Regenerates _books/*.md from the Obsidian reading log — both finished books
# (Gelezen '26.md) and what's currently being read (Nu aan het lezen.md).
#
# Run it after editing either file in Obsidian:
#   ruby scripts/sync_reading.rb
# Then review the diff and commit/push as normal — this script never touches
# git itself.

require 'fileutils'

OBSIDIAN_DIR = File.expand_path(
  "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Daan's notes/Boeken"
)
# Filenames below use a curly quote (’), not a straight apostrophe.
GELEZEN_FILE = File.join(OBSIDIAN_DIR, "Gelezen ‘26.md")
CURRENTLY_READING_FILE = File.join(OBSIDIAN_DIR, 'Nu aan het lezen.md')
BOOKS_DIR = File.expand_path('../_books', __dir__)

def slugify(str)
  str.unicode_normalize(:nfkd)
     .gsub(/[^\x00-\x7F]/, '') # drop diacritics (é -> e, ë -> e, ő -> o, ...)
     .downcase
     .gsub(/['’"]/, '')        # drop apostrophes rather than turning them into dashes
     .gsub(/[^a-z0-9]+/, '-')
     .gsub(/\A-+|-+\z/, '')
end

# Turns a quote file's paragraphs into blockquote Markdown. Each block is
# separated by a blank line. A trailing "p.NN" / "p. NN" becomes a citation
# line; surrounding smart/straight quote marks are stripped.
def parse_quotes(text)
  blocks = text.strip.split(/\n\s*\n/).map(&:strip).reject(&:empty?)
  blocks.map do |block|
    if block =~ /\A(.+?)\s+p\.\s*(\d+)\z/m
      quote_text = Regexp.last_match(1).strip
      page = Regexp.last_match(2)
    else
      quote_text = block
      page = nil
    end
    quote_text = quote_text.gsub(/\A["“]+/, '').gsub(/["”]+\z/, '').strip
    lines = quote_text.split("\n").map { |l| "> #{l}" }.join("\n")
    page ? "#{lines}\n>\n> — p.#{page}" : lines
  end.join("\n\n")
end

def write_book_file(path, title:, author:, order:, status:, body:, finished: nil)
  front_matter = +<<~FM
    ---
    layout: book
    title: "#{title.gsub('"', '\\"')}"
    author: "#{author.gsub('"', '\\"')}"
    order: #{order}
    status: #{status}
  FM
  front_matter << "finished: #{finished}\n" if finished
  front_matter << "---\n"
  content = body.empty? ? front_matter : "#{front_matter}\n#{body}\n"
  File.write(path, content)
end

# A line is either "Author - Title" or, once you start dating entries,
# "YYYY-MM-DD - Author - Title" (also accepts YYYY/MM/DD). Returns
# [date_or_nil, author, title], with the date normalized to YYYY-MM-DD.
def parse_line(line)
  if line =~ %r{\A(\d{4})[/-](\d{2})[/-](\d{2})\s+-\s+(.+?)\s+-\s+(.+)\z}
    date = [Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3)].join('-')
    [date, Regexp.last_match(4).strip, Regexp.last_match(5).strip]
  else
    author, title = line.split(' - ', 2)
    return [nil, nil, nil] unless author && title

    [nil, author.strip, title.strip]
  end
end

# Syncs every line in `source_file` to a _books/*.md file with the given
# `status`. Returns the slugs it wrote.
def sync_list(source_file, status, quote_files)
  return [] unless File.exist?(source_file)

  lines = File.readlines(source_file).map(&:strip).reject(&:empty?)
  lines.each_with_index.map do |line, i|
    finished, author, title = parse_line(line)
    next unless author && title

    order = i + 1

    expected_name = "#{author} - #{title}.md".downcase
    quote_file = quote_files.find { |f| File.basename(f).downcase == expected_name }
    body = quote_file ? parse_quotes(File.read(quote_file)) : ''

    slug = slugify("#{author} #{title}")
    write_book_file(
      File.join(BOOKS_DIR, "#{slug}.md"),
      title: title, author: author, order: order, status: status, body: body, finished: finished
    )
    slug
  end.compact
end

abort "Can't find #{GELEZEN_FILE} — check OBSIDIAN_DIR in this script." unless File.exist?(GELEZEN_FILE)

FileUtils.mkdir_p(BOOKS_DIR)

excluded_files = ["Gelezen ‘26.md", 'Leeslijst.md', 'Nu aan het lezen.md']
quote_files = Dir.glob(File.join(OBSIDIAN_DIR, '*.md')).reject do |f|
  excluded_files.include?(File.basename(f))
end

read_slugs = sync_list(GELEZEN_FILE, 'read', quote_files)
reading_slugs = sync_list(CURRENTLY_READING_FILE, 'reading', quote_files)
updated_slugs = read_slugs + reading_slugs

puts "Synced #{read_slugs.size} read + #{reading_slugs.size} currently-reading book(s) from Obsidian into _books/."
puts 'Review with: git status / git diff _books/'

%w[read reading].each do |status|
  existing = Dir.glob(File.join(BOOKS_DIR, '*.md')).select do |f|
    File.read(f).match?(/^status: #{status}$/)
  end.map { |f| File.basename(f, '.md') }

  stale = existing - updated_slugs
  next if stale.empty?

  puts "\nThese _books/ files are marked status: #{status} but no longer match an Obsidian entry:"
  stale.each { |s| puts "  - #{s}.md" }
  puts '(Not deleted automatically — remove by hand if that book really came off the list.)'
end
