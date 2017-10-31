/**
 * Created by James on 13/09/2016.
 */


// Other pieces of code will use mixin functions from here.
//  May not fit in the inheritance chain that well because node is in some ways a feature and utility, not just what powers the server.

// Or could a huge amount all be within one file, many local functions?

var jsgui = require('jsgui3');
//console.log('jsgui', jsgui);
var each = jsgui.each;
//console.log('each', each);
//throw 'stop';

var Remote_Server = require('remote-server');

var ncp = require('ncp');
var os = require('os');

var fs = require('fs');
var fs2 = jsgui.fs2;

var path = require('path');
var targz = require('tar.gz');


var config = require('my-config').init({
	path : path.resolve('../../config/config.json')//,
	//env : process.env['NODE_ENV']
	//env : process.env
});



var latest_node_version = '8.8.1';

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

	ensure_node(version = latest_node_version, callback) {
		var that = this;

		that.get_node_version((err, res_version) => {
			if (err) {
				// command not found?
				// assume no node
				that.install_node(version, callback);
				//callback(err);
			} else {
				console.log('res_version', res_version);
				console.log('version', version);
				if (res_version !== version) {
					that.uninstall_node((err, res_uninstall) => {
						if (err) {
							callback(err);
						} else {
							that.install_node(version, callback);
						}
					})
				} else {
                    callback(null, res_version);
				}

			}
		})
	};

	// uninstall node

	//  /usr/local/lib/node_modules
	//  /usr/local/include/node
	//  /usr/local/include/node_modules
	//  /usr/local/bin/node
	//  remove from bash profile

	// function to remove multiple directories

	// rm -rf mydir mydir2

	uninstall_node(callback) {

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

	install_node(node_version = latest_node_version, callback) {

		// install latest version...?
		console.log('node_version', node_version);
		//throw 'stop';


		this.install_node_version(node_version, callback);
	}

	install_node_version(version, callback) {
		var that = this;
		that.download_build_install('https://nodejs.org/dist/v' + version + '/node-v' + version + '.tar.gz', function(err, res_dbi) {
			if (err) {
				callback(err);
			} else {
				//console.log('res_dbi', res_dbi);

				callback(null, true);
			}
		});
	}

	get_node_version(callback) {
		this.bash_command('node -v', (err, res_command) => {
			if (err) {
				callback(err);
			} else {
				console.log('res_command', res_command);
				var res;
				if (res_command.length > 0) {
					res = res_command.substr(1);
				};
				callback(null, res);
			}
		});
	}

	ensure_node_version(version = latest_node_version, callback) {
		var that = this;
		that.get_node_version((err, node_version) => {
			if (err) {throw err; } else {
				console.log('node_version', node_version);
				throw 'stop';
				if (node_version === version) {
					callback(null, version);
				} else {

					that.uninstall_node((err, res_uninstall) => {
						if (err) {

						} else {
							console.log('res_uninstall', res_uninstall);


						}
					});

					// delete node installation, install with given.


					// upgrade node.js




					// Delete the existing node
					//  Download and install from source
					//   Would be nice to be able to use the remote servers to download the source, build it, then compress that and send it back to the client for reuse
					//

					console.log('node_version', node_version);
					//throw 'stop';
					if (callback) callback(null, node_version);


				}
			}
		})

	}

	// May wish to upload a package of my own rather than deploy through the npm network.
	//  It may not be ready for publishing, I may wish to test it.


	// Deploying specific node code is very important.
	//  Need to be able to deploy to the server, as well as publish it to npm.

	// Upload code to www (or other) directory
	//  run it, with a mechanism to keep it restarted

	// should install and use pm2 for a variety of things

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

	get_package_version(name, callback) {
		// npm -v
		var command = 'npm list -g --depth=0 ' + name;

		// npm list -g --depth=0 pm2
		this.bash_command(command, (err, res_command) => {
			if (err) {
				callback(err);
			} else {
				callback(null, res_command);
			}
		});

	}

	// npm list -g --depth=0 pm2


	install_npm_package_global(name, callback) {
		// global install
		var command = 'npm install ' + name + ' -g';
		// npm list -g --depth=0 pm2
		this.bash_command(command, (err, res_command) => {
			if (err) {
				callback(err);
			} else {
				callback(null, res_command);
			}
		});
	}

	// Want to install npm packages in the /var/www directory

	install_npm_package_www(name, callback) {
		var that = this;
		//var command = '[[ -d /var/www ]] || mkdir /var/www cd /var/www npm install ' + name;
		var command = 'cd /var/www\nnpm install ' + name;
		//
		// ensure_directory

		that.ensure_directory('/var/www', (err, res_make) => {
			if (err) {
				callback(err);
			} else {
				that.bash_command(command, (err, res_command) => {
					if (err) {
						callback(err);
					} else {
						console.log('res_command', res_command);

						callback(null, res_command);
					}
				});
			}
		});

	}

	// Should probably use ncp, functional filter seems best.
	//  regex is other option.



	// Will also want to be able to deploy the same JavaScript / files to multiple servers at once.



	'deploy_javascript_root'(disk_path, remote_path, callback) {
		var tmpdir = os.tmpdir();
		var that = this;

		// create a new directory within temp
		//  jsgui-deploy
		//  and then within that there could be more deployment directories.


		// Doing this without a temp directory would be faster.


		var jsgui_temp_path = path.join(tmpdir, 'jsgui');

		fs2.ensure_directory_exists(jsgui_temp_path, (err, res_exists) => {
            fs2.dir_contents(jsgui_temp_path, (err, res_contents) => {
            	if (err) {
            		callback(err);
				} else {
            		//console.log('res_contents', res_contents);

            		//throw 'stop';
            		// need to look at the names of the files, the last number.
					//  will have temp files put in there sequentially.
					//  will try to delete the temp files / directories when they are no longer needed.

					var i_temp_dir = 0;

            		if (res_contents.directories) {
                        i_temp_dir = res_contents.directories.length;

					}
					else {

					}

					var temp_dir_path = path.join(jsgui_temp_path, i_temp_dir + '');
            		//console.log('temp_dir_path', temp_dir_path);

            		var temp_tar_gz_path = path.join(jsgui_temp_path, i_temp_dir + '.tar.gz');

                    fs2.ensure_directory_exists(temp_dir_path, (err, res_exists) => {
						if (err) {
							callback(err);
                        } else {
							// copy the stuff there.

                            ncp(disk_path, temp_dir_path, {
                                'filter': (copied_file_name) => {



                                    var s_file_name = copied_file_name.split('\\').join('/').split('/');
                                    //console.log('s_file_name', s_file_name);
                                    // then see if any of them are node_modules.

									var res = true;
									
									// could check against a filter list
									//  gitignore or similar.

									// Maybe we do want to copy some of these anyway.

                                    each(s_file_name, (file_name_part, i) => {
                                        if (file_name_part === 'node_modules') {
                                            res = false;
                                        }
                                        if (file_name_part === '.git') {
                                            res = false;
                                        }
                                        if (file_name_part === '.idea') {
                                            res = false;
										}
										if (file_name_part === '.vscode') {
                                            res = false;
                                        }
                                        if (file_name_part === '.gitignore') {
                                            res = false;
                                        }
                                        if (file_name_part === '.npmignore') {
                                            res = false;
										}
										if (file_name_part === 'DS_Store') {
                                            res = false;
										}
										/*
                                        if (file_name_part === 'LICENSE') {
                                            res = false;
                                        }
                                        if (file_name_part === 'README.md') {
                                            res = false;
										}
										*/
										if (file_name_part === 'package-lock.json') {
                                            res = false;
                                        }
                                        // .gitignore
                                    });
                                    //console.log('copied_file_name', copied_file_name);

                                    return res;
                                }
                            }, (err, res_ncp) => {
                                if (err) {
                                    console.log('err', err);

                                } else {
                                    //console.log('res_ncp', res_ncp);

                                    var read = targz({
                                        level: 9, // Maximum compression
                                        memLevel: 9
                                    }, {
                                        fromBase: true
									}).createReadStream(temp_dir_path);


                                    var write = fs.createWriteStream(temp_tar_gz_path);
                                    read.pipe(write);

                                    write.on('close', () => {
                                    	//console.log('writing file ' +  temp_tar_gz_path + ' closed');

                                    	// Then upload it to the server.
										//that.up

										var remote_archive_path = '/var/www/deploy_' + i_temp_dir + '.tar.gz';

										that.upload_file(temp_tar_gz_path, remote_archive_path, (err, res_upload) => {
											if (err) {
												callback(err);
											} else {

												// Would be nice to have different deployment paths.
												//  good to bring together the node modules which are used, many of them locally developed, and package them up
												//  so they can be run on the spot.
												// May have some code that changes paths between relative and npm reference.

												// To begin with, keeping the paths within a relative directory structure makes the most sense.
												//  Package a lot together to avoid dependency hell. Use Browserify to package specific code.






												//console.log('res_upload', res_upload);

												// option for the deployment directory?



												// then decompress it on the server.
												//  decompressing to named or numbered deployments sounds like the best option.







                                                that.bash_command('tar -zxf ' + remote_archive_path + ' -C ' + remote_path, (err, res_bash_command) => {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        //console.log('res_bash_command', res_bash_command);

                                                        that.delete_file(remote_archive_path, (err, res_archive_deleted) => {
                                                        	if (err) {
                                                        		callback(err);
															} else {
                                                        		//console.log('res_archive_deleted', res_archive_deleted);


                                                        		// delete the local temporary directory and archive.

																fs.unlink(temp_tar_gz_path, (err) => {
																	if (err) {
																		callback(err);
																	} else {
																		//console.log('local archive file deleted');

																		fs2.delete(temp_dir_path, (err) => {
																			if (err) {
																				callback(err);
																			} else {
																				//console.log('local deployment directory copy of files deleted');

																				callback(null, true);
																			}
																		})
																	}
																});

															}
														})


                                                        // remove the remote archive file





                                                    }
                                                });




											}
										});


									});





									// Then compress them...



                                }
                            });
                        }
                    });

            		// copy everything into the temp dir path...


				}
			});
		});

	}


	// Will upload module directories from one JavaScript directory.
	//  There will be a bunch of modules to upload

	// Should upload single directory of JavaScript first...?

	// However, uploading a ZIP or other archive file, then decompressing it seems like the best option in terms of performance.

	//  Would make sense to copy all of the files to a temporary location.
	//   Then to ZIP them up in that location.
	//   Could include all files in a specific location,
	//    Exclude some named files / directories / paths.

	// Will copy a directory structure from one given local place to another, recursively, but avoiding the files to ignore.

	// Copy a specific directory structure, and then ignore specific files from it.
	//  Part of fs2











};

var p = Remote_Node_Server.prototype;
p.ensure_npm_package = p.install_npm_package;

if (require.main === module) {

	var server_data2 = config.remote_nodes.data2;
	console.log('server_data2', server_data2);

	//var remote_node_server = new Remote_Node_Server(server_data2);
	var remote_node_server = new Remote_Node_Server(config.remote_nodes.data1);
	

	var get_node_version = () => {
        remote_node_server.get_node_version(function(err, res) {
            if (err) {
                throw err;
            } else {
                console.log('res', res);
                remote_node_server.disconnect();
            }
        });
	};

	var full_deploy = () => {
        remote_node_server.ensure_node(latest_node_version, (err, res_ensure) => {
            if (err) {
                console.trace();
                throw err;
            } else {
                var that = this;
				console.log('res_ensure', res_ensure);
				
				// Would look in the config for the dev path.

				// 

				// code_root_path
				

                remote_node_server.deploy_javascript_root(config.code_root_path, '/var/www/', (err, res_deploy_js) => {
                    if (err) {
                        console.log('err', err);
                    } else {
                        console.log('res_deploy_js', res_deploy_js);

                    };
				});
				
			
            }
        });
	};
    full_deploy();

	// May be able to compile in one place and then deploy the binaries.

	var ver = () => {
		console.log('pre get node_version');
		remote_node_server.get_node_version((err, node_version) => {
			if (err) {
				throw err;
			} else {
				console.log('node_version', node_version);
				remote_node_server.disconnect();
			};
		});
	}
	//ver();

	

	// Also want to get various servers running different roles.
	//  Starting and stopping installed applications will be the way to do this.

	// A server monitoring / general purpose app will be very useful.
	//  Having the core of jsgui server running on a number of different servers will be useful.

	// Worth building some more server / CPU status and process monitoring software.
	//  Fixing jsgui3 would make sense.










	// Deploying a bundle of software to the server is useful.
	//  Don't want to always send all software, some may be confidential or have confidential info.

	// Deploying a list of specific modules.
	//  All that match a pattern.
	//   Don't match a pattern / match a NOT pattern.

	// A server status resource would be quite good.
	//  Though it would work nicely packaged as a server status application.

	// Make use of a variety of components / resources, but having the app packaged neatly into a runnable node application would be nice.

	// A readout a bit like top.
	//  Having the streaming server as part of jsgui server?

	// Handling subscriptions of streaming data is important.
	//  Will do more network management soon.
	//  Want to get more code running, tried and tested.



	// give it a possible bundle name...?

	// ensure most recent node installation


	/*



	*/



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
	};
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

	/*

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
	*/


	// get_cpu_timed_amalgamated_proportion_nonidle

	// get_proc_meminfo
	/*
	remote_node_server.get_proc_meminfo(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});
	*/

	/*
	remote_node_server.get_memproc_info_bytes(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});
	*/


	// get_mem_prop_free
	/*
	remote_node_server.get_mem_prop_used(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});
	*/

	// can use the 'n' package to ensure the latest node.js version.
	// ensure node version at least...

	/*
	remote_node_server.install_node(function(err, res) {
		if (err) {
			throw err;
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});

	*/
	// install_node
	// get_node_version
	/*


	remote_node_server.ensure_fail2ban(function(err, res) {
		if (err) {
			//throw err;
			// Shows output as errors.
		} else {
			console.log('res', res);
			remote_node_server.disconnect();
		}
	});
	*/
	// ensure_fail2ban
	// get_memproc_info_bytes
	// uninstall_node

	/*'
	 remote_node_server.uninstall_nvm((err, res_uninstall) => {

	 })
	 */

	// Got a lot of code here!!!
	//  Mainly want to ensure that all of the files we have got, or a large subsection of them, are deployed remotely.


	/*

	var deploy_js = function() {
		remote_node_server.deploy_javascript_root('D:\\Dropbox\\code\\js', );


	}





	var basic_setup = function() {
        remote_node_server.ensure_node((err, res_ensure) => {
            if (err) {
                console.trace();
                throw err;
            } else {
                var that = this;
                console.log('res_ensure', res_ensure);

                remote_node_server.install_npm_package_www('single-line-log', (err, res_install) => {
                    if (err) {
                        // raising the error callback form the output?

                        console.log('err', err);

                        //throw err;
                    } else {
                        console.log('res_install', res_install);

                        // deploy_local_javascript_app_directory
                        //  deploys a directory stored locally to the server
                        //  uploads it
                        //  could also npm install the requirements, as it may not be a package with package.json
                        //   want the node_modules to be in the /var/www directory.

                        // Apps may rely on other apps also being deployed in the /var/www directory

                        //var local_

                        var nextlevel_path = 'C:\\Users\\James\\Documents\\Coding\\2016OctJS\\nextleveldb-server';

                        remote_node_server.upload_directory_via_archive(nextlevel_path, '/var/www/nextlevel-db-server', (err, res_upload) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log('res_upload', res_upload);
                            }
                        });

                    }
                });

                // Want to deploy works-in-progress from local dev machine to a server quickly.
                //  Upload directories, including files, but ignore some.
                //  Could process the gitignore.

                // Want to ensure that specific code from this machine is in place.

                // Put it in /var/www/module_name

                // Modules to be installed into the /var/www directory.

                // Install modules to that directory with npm (within node_modules)
                // Upload the tools / modules we are using / are not published on npm.


            }
        });
	}

	*/






} else {
	//console.log('required as a module');
}

module.exports = Remote_Node_Server;