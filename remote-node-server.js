/**
 * Created by James on 13/09/2016.
 */


// Other pieces of code will use mixin functions from here.
//  May not fit in the inheritance chain that well because node is in some ways a feature and utility, not just what powers the server.


/**
 * Created by James on 12/09/2016.
 */
var Remote_Server = require('../remote-server')

// Need to see what the config is

// This should check NGINX is there, as well as check that it's configured to send traffic for the various sites.
//  Should be for a single edge server

// For the moment will use nginx?
//  Or extend this with remote-nginx-server
//   Could make the remote-nginx-server an extension of a remote-edge-server abstraction that deals with the nginx specific things
//    or remote-edge-nginx-server (to specifically use nginx in an edge server configuration)

// remote-app-server
// remote-app-node-server




// remote-db-leveldb-server

// The remote-db-leveldb-server will use functionality from this.
//  It will ensure it is set up with a recent version of node.js
//  It will then ensure that my level-server package is installed there, and set up to run.






// Could be given remote-app-servers
//

// Code to deploy node.js apps onto the server
//


// This server may also deal with authentication?
//  Maybe that will be best on a dedicated server, or dedicated JS object.
//   Some fairly basic authentication and authorization could take place on the edge. It could also consult a permissions server.

// We may want to set it up so that multiple JavaScript objects refer to the same server, so they share resources?
//  But that leads to infinite complexity there.

class Remote_Node_Server extends Remote_Server {

	// Install node

	//  Is it running node by itself or with nvm

	// install node from source, no nvm





	// Ensure node is running

	// See what the present node version is

	// Make use of nvm.
	//  ???
	//   Not sure it allows building from source.

	// Build and install remote code.

	// The build instruction will stream code back.
	//  That could be used for progress events even.

	// Want to write code that issues build instructions in a general way.
	//  Abstracting away the repeated things.
	//  Will be good if the








	// uninstall node

	//  /usr/local/lib/node_modules
	//  /usr/local/include/node
	//  /usr/local/include/node_modules
	//  /usr/local/bin/node
	//  remove from bash profile

	// function to remove multiple directories

	// rm -rf mydir mydir2

	uninstall_node(callback) {

		/*



		 */

		var that = this;

		that.remove_node_bash_profile_line((err, res_remove_line) => {
			if (err) {
				throw err;
			} else {
				console.log('res_remove_line', res_remove_line);

				this.delete_directories(['/usr/local/lib/node_modules',
						'/usr/local/include/node',
						'/usr/local/include/node_modules',
						'/usr/local/bin/node'], (err, res_delete) => {
						// remove the reference from the bash profile
						if (err) {
							callback(err);
						} else {
							callback(null, true);
						}

					}
				);
			}
		});
	}


	remove_node_bash_profile_line(callback) {
		var that = this;
		that.remove_bash_profile_lines_matching(/^export NODE_PATH=/, callback);
	}


	install_nvm(callback) {
		// curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.7/install.sh | bash

		this.bash_command('curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.7/install.sh | bash', (err, res_command) => {
			if (err) {
				callback(err);
			} else {

				callback(null, true);
			}
		});
	}

	uninstall_nvm(callback) {
		var that = this;

		// https://github.com/creationix/nvm/issues/298

		//that.delete_shell_functions_matching(/^nvm/, callback);

	}

	has_nvm(callback) {
		var that = this;
		if (that._has_nvm) {
			callback(null, true);
		} else {
			that.bash_command('command -v nvm', (err, res_command) => {
				if (err) {
					callback(err);
				} else {
					//console.log('res_command', res_command);
					//console.log('res_command.length', res_command.length);
					callback(null, res_command.length > 0);
				}
			});
		}
	}

	ensure_nvm(callback) {
		var that = this;
		that.has_nvm((err, has_nvm) => {
			if (err) { callback (err) } else {
				console.log('has_nvm', has_nvm);
				if (has_nvm) {
					callback(null, true);
				} else {
					that.install_nvm(callback);
				}


			}
		})
	}



}

if (require.main === module) {
	//console.log('called directly');

	var remote_node_server = new Remote_Node_Server('167.114.148.104', 'root', 'Bl4kPy2CP4SS');


	/*
	remote_node_server.get_bash_profile((err, shell_function_names) => {
		if (err) {
			throw err;
		} else {
			console.log('shell_function_names', shell_function_names);


			//remote_node_server.get_shell_function_names_matching(/^nvm/, (err, matching_function_names) => {
			//	console.log('matching_function_names', matching_function_names);
			//});

		}
	});
	*/

	// '~/.bash_profile'

	var download_bash_profile = () => {
		remote_node_server.download('.bash_profile', function(err, profile) {
			if (err) {
				throw err;
			} else {
				console.log('profile', profile);
				remote_node_server.disconnect();
			}
		});
	}

	var uninstall_node = () => {
		remote_node_server.uninstall_node(function(err, res) {
			if (err) {
				throw err;
			} else {
				console.log('res', res);
				remote_node_server.disconnect();
			}
		});
	}
	//uninstall_node();

	// get_cpuinfo

	var get_cpuinfo = () => {
		remote_node_server.get_cpuinfo(function(err, res) {
			if (err) {
				throw err;
			} else {
				console.log('res', res);
				remote_node_server.disconnect();
			}
		});
	}
	//get_cpuinfo();



	// get_cat_proc_stat
	/*
	remote_node_server.get_cat_proc_stat_1s_diff(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});

	*/


	var measure_cpu_business = () => {
		remote_node_server.get_cpu_timed_amalgamated_proportion_nonidle_core_count(1000, function(err, res) {
			if (err) {
				throw err;
			} else {
				console.log('res', res);
				remote_node_server.disconnect();
			}
		});
	}


	// get_cpu_timed_amalgamated_proportion_nonidle

	// get_proc_meminfo

	remote_node_server.get_proc_meminfo(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});


	// uninstall_node

	/*
	 remote_node_server.uninstall_nvm((err, res_uninstall) => {

	 })
	 */




} else {
	//console.log('required as a module');
}

module.exports = Remote_Node_Server;