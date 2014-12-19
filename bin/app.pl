#!/usr/bin/env perl
use Dancer;
our $VERSION = '0.1';

get '/' => sub {
    template 'index', {}, { layout => 'main' };
};
dance;
