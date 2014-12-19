#!/usr/bin/perl 
use File::Slurp;
use Data::Dumper;
my $line = read_file('TIMTOWDI');
my $meat = ($line =~ /"(.*)"/g)[0];
 my $mirc = 
  {
  '0' => 'white',
  '1' => 'black',
  '2' => 'blue',
  '3' => 'green',
  '4' => 'red',
  '5' => 'brown',
  '6' => 'purple',
  '7' => 'orange',
  '8' => 'yellow',
  '9' => 'light green',
  '10' => 'teal',
  '11' => 'light cyan',
  '12' => 'light blue',
  '13' => 'pink',
  '14' => 'gray',
  '15' => 'light gray',
  };
  my $term_background = 
  {
  'white' => '107',
  'black' => '40',
  'blue' => '44',
  'green' => '42',
  'red' => '41',
  'brown' => '101', #light yellow
  'purple' => '45',
  'orange' => '101',
  'yellow' => '43',
  'light green' => '102',
  'teal' => '46',
  'light cyan' => '106',
  'light blue' => '104',
  'pink' => '105',
  'gray' => '100',
  'light gray' => '47',
  };
  my $term_foreground = 
  {
  'white' => '97',
  'black' => '30',
  'blue' => '34',
  'green' => '32',
  'red' => '31',
  'brown' => '93', #light yellow
  'purple' => '35',
  'orange' => '91',
  'yellow' => '33',
  'light green' => '92',
  'teal' => '36',
  'light cyan' => '96',
  'light blue' => '94',
  'pink' => '95',
  'gray' => '90',
  'light gray' => '37',
  };

sub process_string {
  my $fg_code = process_foreground($_[0]);
  my $bg_code = process_background($_[1]);
  my $content = $_[2];
  return sprintf("\033[1;%s;%sm%s\033[0m", $fg_code, $bg_code, $content)
}
sub process_foreground{
  my $num = shift; 
  return $term_foreground->{$mirc->{$num}};
}
sub process_background{
  my $num = shift; 
  return $term_background->{$mirc->{$num}};
}
my @parts = map { $_ =~ s/\\n/\n/g; $_ } map { $_ =~ s/^(\d+),(\d+)(.*)/process_string($1, $2, $3)/e; $_; } split(/\\x03/, $meat);

write_file(
  'timtowdi.ascii',
  join('', @parts)
);
