require 'digest/md5'

# get a temporary name for a script file to hold concatenated
# scripts in an html file
def concat_script_name html_name
	name = "contcatenated-#{ html_name }#{'.js'}"
	name.gsub /\//, "" #get rid of any /'s
end

# generate a name for a script file by taking a MD5
# hash of its contents
def hash_script_name path, opts = {}
	opts[:prefix] ||= ""
	opts[:ext] ||= ".js"
	# hash the file and append.js
	"#{opts[:prefix]}#{Digest::MD5.file(path).to_s}.js"
end

# concatenate the list of scripts, in order in one file
# specified by @output_path
def concat_scripts script_files, output_path
	File.open output_path, "w" do |out|
		script_files.each { |in_path| out.puts(IO.read(in_path)) }
	end
end

# generate an html script tag for given src path
def script_tag src
	"<script src='#{src}' type='text/javascript'></script>"
end

# create all leading dirs in a path if they do not
# exist
def create_leading_dirs path
	dir_path = File.dirname(path)
	FileUtils.mkdir_p dir_path unless File.exists? dir_path
end

namespace :build do

	desc "build extension" 
	task :crx do
		path = File.join @config[:proj_root_dir], @config[:publish_dir]
		puts "packaging contents of #{path} as a .crx"
		puts `#{@config[:chrome_command]} --pack-extension=#{path} --pack-extension-key=#{@config[:pem_path]}`

		# have to manually move it where it needs to go:
		`mv #{@config[:publish_dir]}.crx #{@config[:crx_path]}`
	end

	# TODO publishing to the chrome web store does not require a packed extension
	# only a zip of its contents.
	# desc "build extension" 
	# task :crx do
	# 	`zip readium.zip -r readium/*`
	# end

	desc "Minify and copy all scripts into publish dir"
	task :scripts => "create_workspace" do
		puts "compressing the individual scripts and moving into #{@config[:publish_dir]}"
		jsfiles = File.join(@config[:scripts_dir], "**", "*.js")
		script_list = Dir.glob(jsfiles)

		# remove any scripts that should be excluded
		script_list.reject! {|path| @config[:exclude_scripts].include? path }

		script_list.each do |in_path|
			out_path = File.join(@config[:publish_dir], in_path)

			# we need to create the leading subdirs because
			# yui will fail if they do not exist
			dir_path = File.dirname(out_path)
			FileUtils.mkdir_p dir_path unless File.exists? dir_path

			puts "compressing #{in_path}"
			output = `java -jar #{@config[:cc_jar_path]} --js #{in_path} --js_output_file #{out_path}`
		end
	end

	desc "copy over files that require no processing"
	task :copy do
		cops = @config[:simple_copies] + @config[:js_libs]
		cops.each do |pattrn|
			Dir.glob(pattrn).each do |in_path|

				out_path = File.join(@config[:publish_dir], in_path)

				create_leading_dirs out_path
				
				if File.directory? in_path
					FileUtils.mkdir_p out_path
				else
					FileUtils.cp in_path, out_path
				end
			end

		end
	end

	desc "copy over the html files and replace script tags with ref to one concat script"
	task :html do
		@config[:html_files].each do |in_path|
			out_path = File.join(@config[:publish_dir], in_path)
			content = IO.read(in_path)
			puts in_path

			script_name = concat_script_name in_path
			script_name = File.join @config[:publish_dir], @config[:scripts_dir], script_name
			puts "concatenating scripts into #{script_name}"

			
			x = @config[:scripts_regex].match content
			x ||= ""
			srcs = []
			x.to_s.scan(/<script src=(['"])(.+?)\1 .+?<\/script>/)  { |res| srcs << res[1]}
			srcs.map! {|src| File.join @config[:publish_dir], src }
			concat_scripts srcs, script_name

			hash_name = hash_script_name script_name
			hash_name = File.join "/", @config[:scripts_dir], hash_name
			File.rename script_name, File.join(@config[:publish_dir], hash_name)

			


			x = content.gsub @config[:scripts_regex], script_tag(hash_name)

			out_path = File.join(@config[:publish_dir], in_path)
			create_leading_dirs out_path

			File.open out_path, "w" do |out|
				out.puts x
			end
		end
	end

	desc "Create working dirs for the build process"
	task :create_workspace => "clean:total" do
		puts "creating the working dir"
		puts `mkdir #{@config[:publish_dir]}`
	end

	namespace :clean do

		desc "clean up the results of the last build"
		task :total => ["publish", "crx"]

		desc "remove the pubish direcory"
		task :publish do
			puts "removing the old publish dir if it exists"
			`rm -rf #{@config[:publish_dir]}`
		end

		desc "remove the .crx file"
		task :crx do
			puts "removing the .crx file"
			`rm #{@config[:crx_path]}`
		end

	end

	desc "The default clean task"
	task :clean => "clean:total"

end

#define the default build process
task :build => ["build:scripts", "build:copy", "build:html", "build:crx"]